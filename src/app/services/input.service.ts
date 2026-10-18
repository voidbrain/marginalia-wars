import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { InputState, emptyInput } from '../domain/combat/combat-engine';

type BindKey = keyof InputState;

const KEY_MAP: Partial<Record<string, BindKey>> = {
  // Player 1 — WASD + FGHBJK
  KeyA: 'left',
  KeyD: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyF: 'light1',
  KeyG: 'light2',
  KeyH: 'heavy',
  KeyJ: 'projectile',
  KeyB: 'special',
  KeyN: 'mercy',
};

/**
 * Keyboard input service. Zoneless-friendly: it writes into mutable state
 * outside Angular's notification path; the game loop reads it each frame.
 */
@Injectable({ providedIn: 'root' })
export class InputService implements OnDestroy {
  readonly p1: InputState = emptyInput();

  private readonly boundKeyDown = (e: KeyboardEvent) => this.onKey(e, true);
  private readonly boundKeyUp = (e: KeyboardEvent) => this.onKey(e, false);

  constructor(private readonly zone: NgZone) {}

  attach(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }

  ngOnDestroy(): void {
    this.detach();
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    const bind = KEY_MAP[e.code];
    if (!bind) return;
    e.preventDefault();
    // Mutations happen in the engine loop; run listener work out of the zone.
    this.zone.runOutsideAngular(() => {
      this.p1[bind] = down;
    });
  }

  snapshotP1(): InputState {
    return { ...this.p1 };
  }

  reset(): void {
    Object.assign(this.p1, emptyInput());
  }
}
