import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStore } from '../../store/game.store';
import { Difficulty } from '../../services/cpu.service';

/**
 * Character & stage selection. Reads the roster from the store; writes only
 * through store actions. Local UI state (which slot is being picked) stays here.
 */
@Component({
  selector: 'app-select-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styleUrl: './select.scss',
  template: `
    <main class="folio" data-testid="select">
      <h1 class="heading">Elige Adversarium</h1>
      <p class="sub">Choose thy combatants and field of battle</p>

      <div class="slots">
        <button
          class="slot p1"
          [class.active]="picking() === 'p1'"
          data-testid="slot-p1"
          (click)="picking.set('p1')"
        >
          <span class="label">Player I</span>
          @if (store.selectedP1(); as c) {
            <img [src]="c.portrait" [alt]="c.name" />
            <span class="who">{{ c.name }}</span>
            <span class="gloss">{{ c.gloss }}</span>
          }
        </button>

        <span class="vs">VS</span>

        <button
          class="slot p2"
          [class.active]="picking() === 'p2'"
          data-testid="slot-p2"
          (click)="picking.set('p2')"
        >
          <span class="label">Player II</span>
          @if (store.selectedP2(); as c) {
            <img [src]="c.portrait" [alt]="c.name" />
            <span class="who">{{ c.name }}</span>
            <span class="gloss">{{ c.gloss }}</span>
          }
        </button>
      </div>

      <ul class="roster" data-testid="roster">
        @for (c of store.roster(); track c.id) {
          <li>
            <button
              class="card"
              [attr.data-testid]="'pick-' + c.id"
              [class.p1]="store.p1CharId() === c.id"
              [class.p2]="store.p2CharId() === c.id"
              (click)="pick(c.id)"
            >
              <img [src]="c.portrait" [alt]="c.name" />
              <span class="name">{{ c.epithet }}</span>
              <span class="hp">HP {{ c.maxHp }}</span>
            </button>
          </li>
        }
      </ul>

      <h2 class="heading small">Locus Proelii</h2>
      <ul class="stages">
        @for (s of store.stages(); track s.id) {
          <li>
            <button
              class="stage-card"
              [attr.data-testid]="'stage-' + s.id"
              [class.current]="store.stageId() === s.id"
              (click)="store.pickStage(s.id)"
            >
              <img [src]="s.background" [alt]="s.name" />
              <span>{{ s.latinTitle }}</span>
            </button>
          </li>
        }
      </ul>

      <div class="options">
        <label class="toggle">
          <input
            type="checkbox"
            data-testid="cpu-toggle"
            [ngModel]="store.cpuEnabled()"
            (ngModelChange)="store.setCpu($event)"
          />
          CPU opponent
        </label>
        <label class="toggle">
          Difficulty
          <select [ngModel]="store.difficulty()" (ngModelChange)="setDifficulty($event)">
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      <div class="actions">
        <button class="btn" data-testid="fight-btn" (click)="start()">To the Margin!</button>
        <button class="btn ghost" (click)="randomize()">Sors Letum (random)</button>
      </div>
    </main>
  `,
})
export class SelectPage {
  readonly store = inject(GameStore);
  private readonly router = inject(Router);

  readonly picking = signal<'p1' | 'p2'>('p1');

  readonly nextSlot = computed(() => (this.picking() === 'p1' ? 'p2' : 'p1'));

  pick(id: string): void {
    if (this.picking() === 'p1') this.store.pickP1(id);
    else this.store.pickP2(id);
    this.picking.set(this.nextSlot());
  }

  setDifficulty(d: string): void {
    this.store.difficulty.set(d as Difficulty);
  }

  randomize(): void {
    const ids = this.store.roster().map((c) => c.id);
    const stages = this.store.stages();
    this.store.pickP1(ids[Math.floor(Math.random() * ids.length)]);
    this.store.pickP2(ids[Math.floor(Math.random() * ids.length)]);
    this.store.pickStage(stages[Math.floor(Math.random() * stages.length)].id);
  }

  start(): void {
    this.store.startFight();
    this.router.navigate(['/fight']);
  }
}
