import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Decorative illuminated-manuscript frame around the arena viewport.
 * Pure CSS/SVG-ish borders with corner flourishes — no state.
 */
@Component({
  selector: 'app-scroll-border',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './scroll-border.scss',
  template: `
    <div class="frame" [attr.data-testid]="testId()">
      <span class="edge top"></span>
      <span class="edge bottom"></span>
      <span class="edge left"></span>
      <span class="edge right"></span>
      <span class="corner tl">✝</span>
      <span class="corner tr">✝</span>
      <span class="corner bl">✝</span>
      <span class="corner br">✝</span>
    </div>
  `,
})
export class ScrollBorder {
  readonly testId = input('scroll-border');
}
