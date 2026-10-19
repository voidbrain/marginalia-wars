import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../../store/game.store';
import { InputService } from '../../services/input.service';
import { CpuService } from '../../services/cpu.service';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  CombatEngine,
  EngineSnapshot,
  GROUND_Y,
  SideInputs,
  emptyInput,
} from '../../domain/combat/combat-engine';
import { FighterRuntime } from '../../domain/combat/combat.types';
import { CharacterDef } from '../../domain/characters/character.types';
import { Fighter } from '../../components/fighter/fighter';
import { Hud } from '../../components/hud/hud';
import { Stage } from '../../components/stage/stage';
import { MoveBanner } from '../../components/move-banner/move-banner';
import { ScrollBorder } from '../../components/scroll-border/scroll-border';

interface FxOverlay {
  kind: 'cavalry' | 'dragon' | 'clouds' | 'lute' | 'head' | 'turd-arc';
  untilMs: number;
  side: 'p1' | 'p2' | 'system';
}

const ROUND_SECONDS = 60;

/**
 * The fight screen. Owns the requestAnimationFrame loop and bridges the pure
 * CombatEngine to signal-based rendering. All rules live in the engine; this
 * component only maps snapshot -> template inputs and reacts to events.
 */
@Component({
  selector: 'app-arena-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Fighter, Hud, Stage, MoveBanner, ScrollBorder],
  styleUrl: './arena.scss',
  template: `
    <div class="frame" data-testid="arena">
      <div class="viewport" #viewport>
        <app-stage
          [background]="stage().background"
          [name]="stage().name"
          [latinTitle]="stage().latinTitle"
        />

        @if (snap(); as s) {
          @for (b of bloodOf(s); track b.id) {
            <img
              class="blood"
              src="assets/sprites/blood-splat.png"
              [style.left.px]="b.pos.x"
              [style.top.px]="b.pos.y"
              alt=""
            />
          }

          @for (pr of projectiles(s); track pr.id) {
            <img
              class="projectile"
              [src]="pr.sprite"
              [style.left.px]="pr.pos.x"
              [style.top.px]="pr.pos.y"
              alt=""
            />
          }

          @for (fx of fxList(); track $index) {
            <div class="fx" [class]="'fx fx-' + fx.kind" [attr.data-side]="fx.side"></div>
          }

          <app-fighter
            [x]="fighterPx(s.p1)"
            [y]="fighterPy(s.p1)"
            [facing]="s.p1.facing"
            [stance]="stanceOf(s.p1)"
            [sprite]="spriteFor(p1Char())"
            [name]="p1Char()?.name ?? 'p1'"
            side="p1"
            [hitFlash]="justHit(s.p1, s)"
          />
          <app-fighter
            [x]="fighterPx(s.p2)"
            [y]="fighterPy(s.p2)"
            [facing]="s.p2.facing"
            [stance]="stanceOf(s.p2)"
            [sprite]="spriteFor(p2Char())"
            [name]="p2Char()?.name ?? 'p2'"
            side="p2"
            [hitFlash]="justHit(s.p2, s)"
          />

          <app-hud
            [p1Name]="p1Char()?.epithet ?? ''"
            [p2Name]="p2Char()?.epithet ?? ''"
            [p1HpPct]="hpPct(s.p1)"
            [p2HpPct]="hpPct(s.p2)"
            [p1MeterPct]="s.p1.meter"
            [p2MeterPct]="s.p2.meter"
            [p1Wins]="store.p1Wins()"
            [p2Wins]="store.p2Wins()"
            [timerSeconds]="timeLeft()"
          />
        }

        <app-move-banner
          [caption]="bannerCaption()"
          [gloss]="bannerGloss()"
          [isMercy]="bannerMercy()"
        />

        @if (intro() && !finished()) {
          <div class="announce" data-testid="announce">{{ introText() }}</div>
        }

        @if (finished()) {
          <div class="overlay-end" data-testid="round-end">
            <p class="verdict">{{ verdictText() }}</p>
            <div class="end-actions">
              <button class="btn" data-testid="rematch-btn" (click)="rematch()">Rematch</button>
              <button class="btn ghost" data-testid="result-btn" (click)="toResult()">
                Chronicler's Verdict
              </button>
            </div>
          </div>
        }

        <app-scroll-border />
      </div>

      <p class="controls-note">
        A/D walk · W jump · S crouch · hold back to block · F/G strikes · H heavy · J projectile · B
        special (50⚜) · N mercy (100⚜) · Esc quit
      </p>
    </div>
  `,
})
export class ArenaPage {
  readonly store = inject(GameStore);
  private readonly input = inject(InputService);
  private readonly cpu = inject(CpuService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private engine!: CombatEngine;
  private p1Prev = emptyInput();
  private p2Prev = emptyInput();
  private rafId = 0;
  private lastTs = 0;
  private elapsedMs = 0;
  private introUntilMs = 1600;
  private hitMarks = new Map<string, number>();

  readonly snap = signal<EngineSnapshot | null>(null);
  readonly finished = signal(false);
  readonly intro = signal(true);
  readonly bannerCaption = signal<string | null>(null);
  readonly bannerGloss = signal('');
  readonly bannerMercy = signal(false);
  readonly fxList = signal<FxOverlay[]>([]);
  readonly timeLeft = signal(ROUND_SECONDS);

  readonly stage = this.store.currentStage;
  readonly p1Char = this.store.selectedP1;
  readonly p2Char = this.store.selectedP2;

  readonly introText = signal('PUGNA!');
  readonly verdictText = signal('');

  constructor() {
    const c1 = this.p1Char();
    const c2 = this.p2Char();
    if (!c1 || !c2) {
      // Direct navigation without selection — bounce back.
      queueMicrotask(() => this.router.navigate(['/select']));
      return;
    }
    this.engine = new CombatEngine({ p1: c1, p2: c2 });
    this.input.attach();
    this.cpu.reset();

    const loop = (ts: number): void => {
      if (this.lastTs === 0) this.lastTs = ts;
      const dt = Math.min(50, ts - this.lastTs);
      this.lastTs = ts;
      this.tick(dt);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent): void => {
      if (e.code === 'Escape') {
        this.router.navigate(['/select']);
      }
    };
    window.addEventListener('keydown', onKey);
    this.destroyRef.onDestroy(() => {
      this.ro?.disconnect();
      cancelAnimationFrame(this.rafId);
      this.input.detach();
      window.removeEventListener('keydown', onKey);
    });
  }

  private tick(dtMs: number): void {
    if (this.finished()) return;
    this.elapsedMs += dtMs;
    this.timeLeft.set(Math.max(0, ROUND_SECONDS - this.elapsedMs / 1000));
    if (this.intro() && this.elapsedMs > this.introUntilMs) this.intro.set(false);
    this.observeViewport();

    const cur1 = this.input.snapshotP1();
    const inputs: Record<'p1' | 'p2', SideInputs> = {
      p1: { current: cur1, previous: this.p1Prev },
      p2: { current: emptyInput(), previous: this.p2Prev },
    };

    if (this.store.cpuEnabled()) {
      const s = this.engine.snapshot();
      const c2 = this.p2Char();
      if (c2) {
        const ai = this.cpu.think(s.p2, s.p1, this.elapsedMs, c2, this.store.difficulty());
        inputs.p2 = { current: ai, previous: this.p2Prev };
        this.cpu.tick();
      }
    }

    this.engine.step(dtMs, inputs);
    this.p1Prev = cur1;
    this.p2Prev = inputs.p2.current;

    this.handleEvents();
    this.snap.set(this.engine.snapshot());

    // Expire FX overlays.
    const fx = this.fxList().filter((f) => f.untilMs > this.elapsedMs);
    if (fx.length !== this.fxList().length) this.fxList.set(fx);

    const s = this.engine.snapshot();
    if (s.roundOver && !this.finished()) {
      this.finished.set(true);
      const winnerSide = s.winnerSide ?? 'p1';
      const winner = winnerSide === 'p1' ? this.p1Char() : this.p2Char();
      this.verdictText.set(`VICTORIA — ${winner?.name ?? 'Nobody'} wins`);
      this.store.finishRound(winnerSide);
    } else if (!s.roundOver && this.timeLeft() <= 0) {
      // Time over: higher HP% wins.
      const s1 = this.engine.snapshot();
      const winnerSide = s1.p1.hp / s1.p1.maxHp >= s2hp(s1) ? 'p1' : 'p2';
      this.finished.set(true);
      this.verdictText.set(
        `TEMPUS FUGIT — ${winnerSide === 'p1' ? this.p1Char()?.name : this.p2Char()?.name} wins on vitality`,
      );
      this.store.finishRound(winnerSide);
    }
  }

  private handleEvents(): void {
    for (const ev of this.engine.drainEvents()) {
      switch (ev.type) {
        case 'special-start':
        case 'mercy-start': {
          const caption = (ev.payload?.['caption'] as string) ?? '';
          const [latin, ...rest] = caption.split('—');
          this.bannerCaption.set(latin.trim());
          this.bannerGloss.set(rest.join('—').trim());
          this.bannerMercy.set(ev.type === 'mercy-start');
          setTimeout(() => this.bannerCaption.set(null), 2000);
          const fxKind = ev.payload?.['fx'] as string;
          const kind: FxOverlay['kind'] =
            fxKind === 'cavalry-charge'
              ? 'cavalry'
              : fxKind === 'snail-charge'
                ? 'clouds'
                : fxKind === 'dragon-summon'
                  ? 'dragon'
                  : 'clouds';
          this.pushFx(kind, ev.source, ev.type === 'mercy-start' ? 2400 : 1500);
          if (ev.type === 'mercy-start' && fxKind === 'lute-dirge')
            this.pushFx('lute', ev.source, 2400);
          break;
        }
        case 'decapitation':
          this.pushFx('head', ev.source, 1600);
          break;
        case 'ko':
          this.introText.set('K.O.!');
          this.intro.set(true);
          this.introUntilMs = this.elapsedMs + 1400;
          break;
        case 'hit': {
          const victim = ev.payload?.['victim'] as string;
          if (victim) this.hitMarks.set(victim, this.elapsedMs);
          break;
        }
        default:
          break;
      }
    }
  }

  private pushFx(kind: FxOverlay['kind'], side: FxOverlay['side'], durationMs: number): void {
    this.fxList.update((list) => [...list, { kind, side, untilMs: this.elapsedMs + durationMs }]);
  }

  /* ---- snapshot -> template mappers (pure functions) ---- */

  /** Engine x (0..960) -> % of viewport width. */
  /**
   * Engine x (960-wide arena units) -> CSS pixels relative to the scaled
   * viewport. Using real px (not %) keeps sprite positioning exact even when
   * the viewport is letterboxed by aspect-ratio, and gives E2E tests a
   * deterministic mapping to measure against.
   */
  fighterPx(f: FighterRuntime): number {
    return this.viewportScale() * f.pos.x;
  }

  /** Engine feet-y -> pixel offset from the viewport's bottom edge. */
  fighterPy(f: FighterRuntime): number {
    const s = this.viewportScale();
    return s * (ARENA_HEIGHT - GROUND_Y) + s * (GROUND_Y - f.pos.y);
  }

  private readonly viewportEl = viewChild<ElementRef<HTMLDivElement>>('viewport');
  private readonly viewportW = signal(960);
  private ro?: ResizeObserver;

  private viewportScale(): number {
    return this.viewportW() / ARENA_WIDTH;
  }

  private observeViewport(): void {
    const el = this.viewportEl()?.nativeElement;
    if (!el || this.ro) return;
    this.ro = new ResizeObserver((entries) => {
      for (const e of entries) this.viewportW.set(e.contentRect.width);
    });
    this.ro.observe(el);
    this.viewportW.set(el.clientWidth);
  }

  stanceOf(f: FighterRuntime): string {
    return f.blocking ? 'block' : f.stance;
  }

  hpPct(f: FighterRuntime): number {
    return (f.hp / f.maxHp) * 100;
  }

  justHit(f: FighterRuntime, s: EngineSnapshot): boolean {
    const at = this.hitMarks.get(f.side);
    return at !== undefined && s.timeMs - at < 160;
  }

  spriteFor(def?: CharacterDef | null): string {
    return def?.sprite ?? 'assets/sprites/rabbit-idle.png';
  }

  projectiles(s: EngineSnapshot) {
    return s.projectiles;
  }

  bloodOf(s: EngineSnapshot) {
    return s.blood;
  }

  rematch(): void {
    this.router.navigate(['/fight']);
  }

  toResult(): void {
    this.router.navigate(['/result']);
  }
}

function s2hp(s: EngineSnapshot): number {
  return s.p2.hp / s.p2.maxHp;
}
