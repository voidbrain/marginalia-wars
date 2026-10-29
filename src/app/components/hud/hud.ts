import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Fight HUD: HP bars, meter bars, round wins, timer. Presentational only —
 * the arena page passes plain numbers each frame.
 */
@Component({
  selector: 'app-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hud.scss',
  template: `
    <div class="hud" data-testid="hud">
      <div class="side p1">
        <div class="name-row">
          <span class="name">{{ p1Name() }}</span>
          <span class="wins">{{ winPips(p1Wins()) }}</span>
        </div>
        <div class="bar hp">
          <div class="fill" data-testid="hp-p1" [style.width.%]="p1HpPct()"></div>
        </div>
        <div class="bar meter"><div class="fill" [style.width.%]="p1MeterPct()"></div></div>
      </div>

      <div class="center">
        <span class="timer" data-testid="timer">{{ timerLabel() }}</span>
        <span class="round-label">{{ roundLabel() }}</span>
      </div>

      <div class="side p2">
        <div class="name-row reverse">
          <span class="wins">{{ winPips(p2Wins()) }}</span>
          <span class="name">{{ p2Name() }}</span>
        </div>
        <div class="bar hp mirror">
          <div class="fill" data-testid="hp-p2" [style.width.%]="p2HpPct()"></div>
        </div>
        <div class="bar meter mirror"><div class="fill" [style.width.%]="p2MeterPct()"></div></div>
      </div>
    </div>
  `,
})
export class Hud {
  readonly p1Name = input.required<string>();
  readonly p2Name = input.required<string>();
  readonly p1HpPct = input.required<number>();
  readonly p2HpPct = input.required<number>();
  readonly p1MeterPct = input.required<number>();
  readonly p2MeterPct = input.required<number>();
  readonly p1Wins = input.required<number>();
  readonly p2Wins = input.required<number>();
  readonly timerSeconds = input.required<number>();
  readonly roundLabel = input<string>('ROUND I');

  timerLabel(): string {
    return String(Math.max(0, Math.ceil(this.timerSeconds())));
  }

  winPips(wins: number): string {
    return '\u25CF'.repeat(wins) + '\u25CB'.repeat(Math.max(0, 2 - wins));
  }
}
