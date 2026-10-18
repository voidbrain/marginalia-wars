import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameStore } from '../../store/game.store';

/**
 * Post-fight chronicle page: who won, the winner's quote, rematch/menu.
 */
@Component({
  selector: 'app-result-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styleUrl: './result.scss',
  template: `
    <main class="folio" data-testid="result">
      <div class="rubric">Explicit Bellum Marginale</div>
      <h1 class="title" data-testid="winner-name">{{ winnerName() }}</h1>

      @if (winner(); as w) {
        <img class="victor" [src]="w.portrait" [alt]="w.name" />
        <p class="quote">&ldquo;{{ store.lastWinQuote() }}&rdquo;</p>
        <p class="epithet">{{ w.epithet }} &mdash; {{ w.gloss }}</p>
      }

      <div class="score" data-testid="score">
        <span>{{ store.p1Wins() }} — {{ store.p2Wins() }}</span>
      </div>

      <nav class="menu">
        <button class="btn primary" data-testid="again-btn" (click)="rematch()">Fight Again</button>
        <a class="btn ghost" routerLink="/select">Choose New Foes</a>
        <a class="btn ghost" routerLink="/" (click)="store.goHome()">Return to the Colophon</a>
      </nav>
    </main>
  `,
})
export class ResultPage {
  readonly store = inject(GameStore);
  private readonly router = inject(Router);

  winnerName(): string {
    const w = this.winner();
    return w ? `${w.name} Triumphant` : 'The Margin Claims All';
  }

  winner() {
    return this.store.lastWinnerSide() === 'p1' ? this.store.selectedP1() : this.store.selectedP2();
  }

  rematch(): void {
    this.store.rematch();
    this.router.navigate(['/fight']);
  }
}
