/**
 * Pure combat vocabulary shared by the domain layer.
 * No Angular, no DOM — only types and plain functions.
 */

export type Facing = 'left' | 'right';

export type Stance =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'crouch'
  | 'block'
  | 'hit'
  | 'ko'
  | 'victory'
  | 'attack'
  | 'special'
  | 'mercy';

export type MoveKind = 'light' | 'heavy' | 'projectile' | 'special' | 'mercy';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** A single attack frame-data entry (in milliseconds). */
export interface MoveTiming {
  startupMs: number;
  activeMs: number;
  recoveryMs: number;
}

export interface HitboxSpec extends Rect {}

export interface MoveDef {
  readonly id: string;
  readonly name: string;
  /** Latin banner caption shown on special/mercy moves. */
  readonly caption: string;
  readonly kind: MoveKind;
  readonly timing: MoveTiming;
  readonly damage: number;
  /** Knockback applied to the victim (px/s along facing). */
  readonly knockback: number;
  readonly hitstunMs: number;
  readonly meterGain: number;
  readonly meterCost: number;
  /** Hitbox relative to the fighter origin (feet center), +x = forward. */
  readonly hitbox?: HitboxSpec;
  readonly projectileId?: string;
  readonly launch?: boolean;
  readonly totalMs: number;
}

export function moveTotalMs(t: MoveTiming): number {
  return t.startupMs + t.activeMs + t.recoveryMs;
}

export interface FighterRuntime {
  readonly fighterId: string;
  readonly side: 'p1' | 'p2';
  pos: Vec2;
  vel: Vec2;
  facing: Facing;
  hp: number;
  maxHp: number;
  meter: number;
  stance: Stance;
  currentMove: MoveDef | null;
  moveElapsedMs: number;
  hitRegistered: boolean;
  stunUntilMs: number;
  invulnerableUntilMs: number;
  jumpCount: number;
  blocking: boolean;
}

export interface ProjectileRuntime {
  readonly id: number;
  readonly projectileId: string;
  readonly ownerSide: 'p1' | 'p2';
  readonly sprite: string;
  pos: Vec2;
  vel: Vec2;
  damage: number;
  hitstunMs: number;
  knockback: number;
  expiresAtMs: number;
  dead: boolean;
}

export interface BloodSprayRuntime {
  readonly id: number;
  pos: Vec2;
  vel: Vec2;
  expiresAtMs: number;
}

export interface CombatEvent {
  readonly atMs: number;
  readonly type:
    | 'hit'
    | 'block'
    | 'projectile-spawn'
    | 'decapitation'
    | 'special-start'
    | 'mercy-start'
    | 'ko'
    | 'round-end';
  readonly source: 'p1' | 'p2' | 'system';
  readonly payload?: Record<string, unknown>;
}
