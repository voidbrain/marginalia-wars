import { Injectable, OnDestroy } from '@angular/core';
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
  /** Keys pressed since the last snapshot: a tap released before the next frame still reads as held for one frame. */
  private readonly tapped = new Set<BindKey>();

  private readonly boundKeyDown = (e: KeyboardEvent) => this.onKey(e, true);
  private readonly boundKeyUp = (e: KeyboardEvent) => this.onKey(e, false);

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
    // Zoneless app: writes go straight into mutable state; the game loop
    // reads it once per animation frame, so no change-detection churn here.
    this.p1[bind] = down;
    if (down) this.tapped.add(bind);
  }

  snapshotP1(): InputState {
    const snap = { ...this.p1 };
    for (const bind of this.tapped) snap[bind] = true;
    this.tapped.clear();
    return snap;
  }

  reset(): void {
    Object.assign(this.p1, emptyInput());
    this.tapped.clear();
  }
}
