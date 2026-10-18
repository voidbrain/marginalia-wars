import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Medieval manuscript banner: shown when a special/mercy move fires.
 * Purely presentational — receives data via signals.
 */
@Component({
  selector: 'app-move-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './move-banner.scss',
  template: `
    @if (caption()) {
      <div class="banner" [class.mercy]="isMercy()" role="status" aria-live="polite">
        <span class="scroll left"></span>
        <div class="ribbon">
          <p class="latin">{{ caption() }}</p>
          <p class="gloss">{{ gloss() }}</p>
        </div>
        <span class="scroll right"></span>
      </div>
    }
  `,
})
export class MoveBanner {
  readonly caption = input<string | null>(null);
  readonly gloss = input<string>('');
  readonly isMercy = input<boolean>(false);
}
