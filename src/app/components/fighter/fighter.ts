import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A single fighter rendered from the engine snapshot. Position/stance are
 * passed as plain numbers/strings each frame by the arena page; this component
 * never mutates game state (strong separation).
 */
@Component({
  selector: 'app-fighter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './fighter.scss',
  template: `
    <div
      class="fighter"
      [class]="'fighter stance-' + stance() + ' facing-' + facing()"
      [style.left.px]="x()"
      [style.bottom.px]="y()"
      [attr.data-testid]="'fighter-' + side()"
    >
      <img class="sprite" [src]="sprite()" [alt]="name()" draggable="false" />
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
}
