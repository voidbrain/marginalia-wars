import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Stage backdrop: parchment arena image + ground line. Presentational only.
 */
@Component({
  selector: 'app-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './stage.scss',
  template: `
    <div class="stage" data-testid="stage">
      <img class="backdrop" [src]="background()" [alt]="name()" draggable="false" />
      <div class="ground" [style.top.%]="groundPct()"></div>
      <div class="latin-title">{{ latinTitle() }}</div>
    </div>
  `,
})
export class Stage {
  readonly background = input.required<string>();
  readonly name = input.required<string>();
  readonly latinTitle = input<string>('');
  readonly groundPct = input<number>(86);
}
