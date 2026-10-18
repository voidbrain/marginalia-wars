import { signal, computed, Injectable } from '@angular/core';
import { CHARACTERS, characterById } from '../data/characters.data';
import { STAGES, stageById, StageDef } from '../data/stages.data';
import { CharacterDef } from '../domain/characters/character.types';

export type GamePhase = 'home' | 'select' | 'fighting' | 'result';

/**
 * Signal store for game meta-state (menus, selections).
 * The fight itself lives in the pure CombatEngine; this store only tracks
 * who is fighting whom, where, and the outcome.
 */
@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly phase = signal<GamePhase>('home');

  readonly roster = signal<readonly CharacterDef[]>(CHARACTERS);
  readonly stages = signal<readonly StageDef[]>(STAGES);

  readonly p1CharId = signal<string>('rabbit');
  readonly p2CharId = signal<string>('knight');
  readonly stageId = signal<string>('meadow');
  readonly cpuEnabled = signal<boolean>(true);
  readonly difficulty = signal<'easy' | 'normal' | 'hard'>('normal');

  /** Round results as wins per side. */
  readonly p1Wins = signal<number>(0);
  readonly p2Wins = signal<number>(0);
  readonly lastWinnerSide = signal<'p1' | 'p2' | null>(null);
  readonly lastWinQuote = signal<string>('');

  readonly selectedP1 = computed(() => characterById(this.p1CharId()));
  readonly selectedP2 = computed(() => characterById(this.p2CharId()));
  readonly currentStage = computed(() => stageById(this.stageId()) ?? STAGES[0]);

  goHome(): void {
    this.phase.set('home');
  }

  goSelect(): void {
    this.p1Wins.set(0);
    this.p2Wins.set(0);
    this.lastWinnerSide.set(null);
    this.phase.set('select');
  }

  pickP1(id: string): void {
    if (characterById(id)) this.p1CharId.set(id);
  }

  pickP2(id: string): void {
    if (characterById(id)) this.p2CharId.set(id);
  }

  pickStage(id: string): void {
    if (stageById(id)) this.stageId.set(id);
  }

  setCpu(enabled: boolean): void {
    this.cpuEnabled.set(enabled);
  }

  startFight(): void {
    this.phase.set('fighting');
  }

  finishRound(winnerSide: 'p1' | 'p2'): void {
    const winner = winnerSide === 'p1' ? this.selectedP1() : this.selectedP2();
    if (winnerSide === 'p1') this.p1Wins.update((w) => w + 1);
    else this.p2Wins.update((w) => w + 1);
    this.lastWinnerSide.set(winnerSide);
    this.lastWinQuote.set(winner?.winQuote ?? '');
    this.phase.set('result');
  }

  rematch(): void {
    this.phase.set('fighting');
  }
}
