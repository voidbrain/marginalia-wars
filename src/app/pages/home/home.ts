import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStore } from '../../store/game.store';

/**
 * Title page — styled like the opening folio of a manuscript.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styleUrl: './home.scss',
  template: `
    <main class="folio" data-testid="home">
      <div class="rubric">Incipit Bellum Marginale</div>
      <h1 class="title">Marginalia Fighters</h1>
      <p class="subtitle">Multo quam ferrum lingua atrocior ferit</p>

      <div class="initial">M</div>
      <p class="body">
        In the margins of forgotten manuscripts, rabbits joust upon snails, nuns rebel, knights
        charge across the sky and jesters deal in heads and dung. Step into the parchment and let
        the grotesques fight.
      </p>

      <nav class="menu">
        <a
          class="btn primary"
          routerLink="/select"
          data-testid="start-btn"
          (click)="store.goSelect()"
        >
          Begin the Combat
        </a>
        <span class="hint">WASD move · F/G jab · H heavy · J projectile · B special · N mercy</span>
      </nav>

      <ul class="roster-strip">
        @for (c of store.roster(); track c.id) {
          <li>
            <img [src]="c.portrait" [alt]="c.name" />
            <span>{{ c.epithet }}</span>
          </li>
        }
      </ul>

      <div class="colophon">Anno Domini MMXXVI — written in the margin, not the text</div>
    </main>
  `,
})
export class HomePage {
  readonly store = inject(GameStore);
}
