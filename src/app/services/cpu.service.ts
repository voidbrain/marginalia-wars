import { Injectable } from '@angular/core';
import { InputState, emptyInput } from '../domain/combat/combat-engine';
import { FighterRuntime } from '../domain/combat/combat.types';
import { CharacterDef } from '../domain/characters/character.types';

export type Difficulty = 'easy' | 'normal' | 'hard';

interface BrainMemory {
  decisionAtMs: number;
  holdUntilMs: number;
  current: InputState;
  previous: InputState;
}

/**
 * Pure-ish CPU brain. Reads the engine snapshot and emits an InputState for p2.
 * Kept separate from the engine so difficulty tuning never touches combat rules.
 */
@Injectable({ providedIn: 'root' })
export class CpuService {
  private memory: BrainMemory = this.freshMemory();

  reset(): void {
    this.memory = this.freshMemory();
  }

  private freshMemory(): BrainMemory {
    return { decisionAtMs: 0, holdUntilMs: 0, current: emptyInput(), previous: emptyInput() };
  }

  think(
    self: FighterRuntime,
    enemy: FighterRuntime,
    timeMs: number,
    def: CharacterDef,
    difficulty: Difficulty,
  ): InputState {
    const m = this.memory;
    const gap = difficulty === 'hard' ? 160 : difficulty === 'normal' ? 340 : 700;
    if (timeMs - m.decisionAtMs >= gap) {
      m.previous = { ...m.current };
      m.current = this.decide(self, enemy, def, difficulty);
      m.decisionAtMs = timeMs;
    }
    return { ...m.current };
  }

  /** Call each frame to release edge-triggered buttons after one tick. */
  tick(): void {
    const m = this.memory;
    // Buttons are one-shot: clear attack flags so `pressed()` works next decision.
    m.previous = { ...m.current };
    m.current = {
      ...m.current,
      light1: false,
      light2: false,
      heavy: false,
      projectile: false,
      special: false,
      mercy: false,
    };
  }

  private decide(self: FighterRuntime, enemy: FighterRuntime, def: CharacterDef, diff: Difficulty): InputState {
    const input = emptyInput();
    const dx = enemy.pos.x - self.pos.x;
    const adx = Math.abs(dx);
    const towardRight = dx > 0;

    // Block probability when enemy attacking nearby.
    const enemyAttacking = enemy.currentMove !== null;
    const blockChance = diff === 'hard' ? 0.75 : diff === 'normal' ? 0.4 : 0.15;
    if (enemyAttacking && adx < 160 && Math.random() < blockChance) {
      if (towardRight) input.left = true;
      else input.right = true;
      return input;
    }

    // Approach or keep range.
    const idealRange = def.moves.projectile ? 260 : 120;
    if (adx > idealRange) {
      if (towardRight) input.right = true;
      else input.left = true;
    } else if (adx < 70) {
      if (towardRight) input.left = true;
      else input.right = true;
    }

    // Attack choices based on range and meter.
    const aggression = diff === 'hard' ? 0.85 : diff === 'normal' ? 0.55 : 0.3;
    if (Math.random() < aggression) {
      if (self.meter >= 100 && adx < 220 && Math.random() < 0.5) {
        input.mercy = true;
      } else if (self.meter >= 50 && adx < 200 && Math.random() < 0.5) {
        input.special = true;
      } else if (adx > 200 && adx < 520 && Math.random() < 0.6) {
        input.projectile = true;
      } else if (adx <= 120) {
        const r = Math.random();
        if (r < 0.45) input.light1 = true;
        else if (r < 0.75) input.light2 = true;
        else input.heavy = true;
      } else if (adx < 190) {
        input.heavy = true;
      }
    }

    // Occasional hop.
    if (diff !== 'easy' && Math.random() < 0.06 && self.pos.y >= 469) {
      input.up = true;
    }

    return input;
  }
}
