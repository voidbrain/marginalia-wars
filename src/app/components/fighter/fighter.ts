import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CharacterParts, PartFrame, RigVars, rigVarsOf } from '../../domain/characters/parts/frames';

/** A layer of the stacked rig (body and/or separated animated arm). */
export interface FighterLayer {
  readonly src: string;
  readonly kind: 'body' | 'arm';
}

const SPRITE_HEIGHT = 170; // px height of every fighter figure on stage

/**
 * A single fighter rendered from the engine snapshot. Position/stance are
 * passed as plain numbers/strings each frame by the arena page; this component
 * never mutates game state (strong separation).
 *
 * When `parts()` supplies layered art (knight / nun) the figure is rendered
 * as STACKED LAYERS — a body-only PNG plus the separated weapon-arm layer
 * (knight's sword arm, the nun's cucumis-launching arm), both saved on the
 * same full canvas so they align pixel-perfectly. The attack timing phase
 * travels down via the `data-phase` attribute; CSS keys the arm keyframes off
 * it. Characters without part data fall back to the single `<img class="sprite">`.
 */
@Component({
  selector: 'app-fighter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './fighter.scss',
  template: `
    <div
      class="fighter"
      [class]="'fighter stance-' + stance() + ' facing-' + facing()"
      [attr.data-phase]="phase()"
      [style.left.px]="x()"
      [style.bottom.px]="y()"
      [attr.data-testid]="'fighter-' + side()"
    >
      @if (layers(); as ls) {
        <div
          class="rig"
          [style.--layer-h.px]="rigVars()?.height ?? SPRITE_HEIGHT"
          [style.--layer-ar]="rigVars()?.aspect ?? 1"
          [style.--foot-off.px]="rigVars()?.footOff ?? 0"
          [style.--ax]="rigVars()?.ax ?? '50%'"
          [style.--ay]="rigVars()?.ay ?? '50%'"
        >
          @for (l of ls; track l.src) {
            <img
              class="sprite layer"
              [class.arm]="l.kind === 'arm'"
              [src]="l.src"
              [alt]="name()"
              draggable="false"
            />
          }
        </div>
      } @else {
        <img class="sprite" [src]="sprite()" [alt]="name()" draggable="false" />
      }
      @if (hitFlash()) {
        <span class="hit-flash"></span>
      }
    </div>
  `,
})
export class Fighter {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly facing = input<'left' | 'right'>('right');
  readonly stance = input<string>('idle');
  readonly sprite = input.required<string>();
  readonly name = input.required<string>();
  readonly side = input<'p1' | 'p2'>('p1');
  readonly hitFlash = input<boolean>(false);
  /** Layered art for this character (from partsFor(fighterId)); null = single img. */
  readonly parts = input<CharacterParts | null>(null);
  /** Attack timing phase from engine frame data: windup | launch | recover | null. */
  readonly phase = input<string | null>(null);

  readonly SPRITE_HEIGHT = SPRITE_HEIGHT;

  /** Rig-box geometry (height, aspect, foot gap, shoulder pivot) for the parts. */
  readonly rigVars = computed<RigVars | null>(() => {
    const parts = this.parts();
    return parts ? rigVarsOf(parts) : null;
  });

  /**
   * Body (+ optional arm) layers shown for the current stance. With a
   * separated arm layer the body stays put while the arm animates through its
   * windup/launch/recover keyframes; characters whose art has no separated
   * arm swap to the flattened attack key art while attacking instead.
   */
  readonly layers = computed<readonly FighterLayer[] | null>(() => {
    const parts = this.parts();
    if (!parts) return null;
    const out: FighterLayer[] = [];
    if (parts.fullCanvas && parts.arm) {
      // Pixel-aligned full-canvas layers: body always, arm on top.
      out.push({ src: parts.idle.src, kind: 'body' });
      out.push({ src: parts.arm.src, kind: 'arm' });
      return out;
    }
    const attacking = ['attack', 'special', 'mercy'].includes(this.stance());
    const body: PartFrame = attacking ? parts.attack : parts.idle;
    out.push({ src: body.src, kind: 'body' });
    if (parts.arm) out.push({ src: parts.arm.src, kind: 'arm' });
    return out;
  });
}
