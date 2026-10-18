import {
  BloodSprayRuntime,
  CombatEvent,
  FighterRuntime,
  ProjectileRuntime,
  Rect,
  rectsOverlap,
} from './combat.types';
import { CharacterDef, PROJECTILES } from '../characters/character.types';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 540;
export const GROUND_Y = 470;
const GRAVITY = 1800;
const WALL_MARGIN = 40;
const MAX_FALL_SPEED = 1400;

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  light1: boolean;
  light2: boolean;
  heavy: boolean;
  projectile: boolean;
  special: boolean;
  mercy: boolean;
}

export function emptyInput(): InputState {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    light1: false,
    light2: false,
    heavy: false,
    projectile: false,
    special: false,
    mercy: false,
  };
}

export interface SideInputs {
  current: InputState;
  previous: InputState;
}

export interface EngineSnapshot {
  p1: FighterRuntime;
  p2: FighterRuntime;
  projectiles: readonly ProjectileRuntime[];
  blood: readonly BloodSprayRuntime[];
  events: readonly CombatEvent[];
  timeMs: number;
  roundOver: boolean;
  winnerSide: 'p1' | 'p2' | null;
}

/**
 * Pure, deterministic fighting-game engine. It owns no Angular or DOM concern:
 * feed it inputs + elapsed ms, read the snapshot, render elsewhere.
 */
export class CombatEngine {
  private nextId = 1;
  private readonly fighters: Record<'p1' | 'p2', FighterRuntime>;
  private projectiles: ProjectileRuntime[] = [];
  private blood: BloodSprayRuntime[] = [];
  private events: CombatEvent[] = [];
  private timeMs = 0;
  private roundOver = false;
  private winnerSide: 'p1' | 'p2' | null = null;

  constructor(
    private readonly chars: Record<'p1' | 'p2', CharacterDef>,
    startPositions?: Record<'p1' | 'p2', number>,
  ) {
    this.fighters = {
      p1: this.spawn(chars['p1'], 'p1', startPositions?.['p1'] ?? 260),
      p2: this.spawn(chars['p2'], 'p2', startPositions?.['p2'] ?? 700),
    };
  }

  private spawn(def: CharacterDef, side: 'p1' | 'p2', x: number): FighterRuntime {
    return {
      fighterId: def.id,
      side,
      pos: { x, y: GROUND_Y },
      vel: { x: 0, y: 0 },
      facing: side === 'p1' ? 'right' : 'left',
      hp: def.maxHp,
      maxHp: def.maxHp,
      meter: 0,
      stance: 'idle',
      currentMove: null,
      moveElapsedMs: 0,
      hitRegistered: false,
      stunUntilMs: 0,
      invulnerableUntilMs: 0,
      jumpCount: 0,
      blocking: false,
    };
  }

  step(dtMs: number, inputs: Record<'p1' | 'p2', SideInputs>): void {
    if (this.roundOver) return;
    this.timeMs += dtMs;
    const dt = dtMs / 1000;

    for (const side of ['p1', 'p2'] as const) {
      const f = this.fighters[side];
      const other = this.fighters[side === 'p1' ? 'p2' : 'p1'];
      const inp = inputs[side].current;
      const prev = inputs[side].previous;
      const def = this.chars[side];

      const stunned = this.timeMs < f.stunUntilMs;
      const busy = f.currentMove !== null;

      // Facing: update only when neutral.
      if (!busy && !stunned && f.pos.y >= GROUND_Y - 1) {
        f.facing = other.pos.x >= f.pos.x ? 'right' : 'left';
      }

      // Movement while free.
      if (!busy && !stunned) {
        let vx = 0;
        if (inp.left) vx -= def.walkSpeed;
        if (inp.right) vx += def.walkSpeed;
        f.blocking = this.isBlocking(f, other, inp);
        if (f.blocking) vx = 0;
        f.vel.x = vx;
        f.stance =
          f.pos.y < GROUND_Y - 1 ? 'jump' : vx !== 0 ? 'walk' : inp.down ? 'crouch' : 'idle';

        if (pressed(inp, prev, 'up') && f.jumpCount < 1) {
          f.vel.y = -def.jumpVelocity;
          f.jumpCount += 1;
          f.stance = 'jump';
        }

        const started = this.tryStartMove(f, def, inp, prev);
        if (!started) {
          this.applyPhysics(f, dt);
        }
      } else if (busy) {
        this.runActiveMove(f, def, other, dt);
      } else {
        // stunned: drift with knockback friction
        f.vel.x *= Math.pow(0.2, dt);
        this.applyPhysics(f, dt);
        if (f.pos.y >= GROUND_Y - 1 && this.timeMs >= f.stunUntilMs) {
          f.stance = 'idle';
        }
      }
    }

    this.updateProjectiles(dt);
    this.updateBlood(dt);
    this.checkRoundEnd();
  }

  private isBlocking(f: FighterRuntime, other: FighterRuntime, inp: InputState): boolean {
    const away = (other.pos.x > f.pos.x && inp.left) || (other.pos.x < f.pos.x && inp.right);
    return away && f.pos.y >= GROUND_Y - 1;
  }

  private tryStartMove(
    f: FighterRuntime,
    def: CharacterDef,
    inp: InputState,
    prev: InputState,
  ): boolean {
    const grounded = f.pos.y >= GROUND_Y - 1;
    const canAct = !f.currentMove && this.timeMs >= f.stunUntilMs;
    if (!canAct) return false;

    const choose = (): (typeof def.moves)[keyof typeof def.moves] | null => {
      if (pressed(inp, prev, 'mercy') && f.meter >= 100 && grounded) return def.moves.mercy;
      if (pressed(inp, prev, 'special') && f.meter >= 50 && grounded) return def.moves.special;
      if (pressed(inp, prev, 'projectile') && grounded) return def.moves.projectile;
      if (pressed(inp, prev, 'heavy')) return grounded ? def.moves.heavy : def.moves.air;
      if (pressed(inp, prev, 'light1')) return grounded ? def.moves.light1 : def.moves.air;
      if (pressed(inp, prev, 'light2'))
        return grounded ? (inp.down ? def.moves.crouchHeavy : def.moves.light2) : def.moves.air;
      return null;
    };

    const move = choose();
    if (!move) return false;
    if (move.meterCost > 0 && f.meter < move.meterCost) return false;

    f.meter = Math.max(0, f.meter - move.meterCost);
    f.currentMove = move;
    f.moveElapsedMs = 0;
    f.hitRegistered = false;
    f.stance = move.kind === 'special' ? 'special' : move.kind === 'mercy' ? 'mercy' : 'attack';
    if (move.kind === 'special' || move.kind === 'mercy') {
      this.events.push({
        atMs: this.timeMs,
        type: move.kind === 'mercy' ? 'mercy-start' : 'special-start',
        source: f.side,
        payload: { caption: move.caption, fx: def.specialFx },
      });
    }
    // Small forward hop on heavies/specials.
    if (move.kind === 'heavy' || move.kind === 'special') {
      f.vel.x = (f.facing === 'right' ? 1 : -1) * 120;
    }
    return true;
  }

  private runActiveMove(
    f: FighterRuntime,
    def: CharacterDef,
    other: FighterRuntime,
    dt: number,
  ): void {
    const move = f.currentMove!;
    f.moveElapsedMs += dt * 1000;
    const t = f.moveElapsedMs;
    const { startupMs, activeMs } = move.timing;

    // Spawn projectile at startup end.
    if (move.projectileId && !f.hitRegistered && t >= startupMs) {
      this.spawnProjectile(f, move.projectileId, move.damage, move.hitstunMs, move.knockback);
      f.hitRegistered = true;
    }

    // Melee hitbox check during active window.
    if (move.hitbox && !f.hitRegistered && t >= startupMs && t <= startupMs + activeMs) {
      const hb = this.worldHitbox(f, move.hitbox);
      const body = this.bodyRect(other);
      if (rectsOverlap(hb, body)) {
        f.hitRegistered = true;
        this.applyHit(
          f,
          other,
          move.damage,
          move.knockback,
          move.hitstunMs,
          move.launch ?? false,
          move.kind,
        );
      }
    }

    // Charge specials actually travel across the arena.
    if (
      move.kind === 'special' &&
      def.specialFx === 'snail-charge' &&
      t >= startupMs &&
      t <= startupMs + activeMs
    ) {
      f.vel.x = (f.facing === 'right' ? 1 : -1) * 360;
    } else {
      f.vel.x *= Math.pow(0.02, dt);
    }

    this.applyPhysics(f, dt);

    if (t >= move.totalMs) {
      f.currentMove = null;
      f.moveElapsedMs = 0;
      f.hitRegistered = false;
      f.stance = 'idle';
    }
  }

  private worldHitbox(f: FighterRuntime, rel: Rect): Rect {
    const dir = f.facing === 'right' ? 1 : -1;
    const x = dir === 1 ? f.pos.x + rel.x : f.pos.x - rel.x - rel.w;
    return { x, y: f.pos.y + rel.y, w: rel.w, h: rel.h };
  }

  bodyRect(f: FighterRuntime): Rect {
    const def = this.chars[f.side];
    return {
      x: f.pos.x - def.bodyWidth / 2,
      y: f.pos.y - def.bodyHeight,
      w: def.bodyWidth,
      h: def.bodyHeight,
    };
  }

  private applyHit(
    attacker: FighterRuntime,
    victim: FighterRuntime,
    damage: number,
    knockback: number,
    hitstunMs: number,
    launch: boolean,
    kind: string,
  ): void {
    if (this.timeMs < victim.invulnerableUntilMs) return;
    const blocked = victim.blocking && kind !== 'special' && kind !== 'mercy';
    const dir = attacker.facing === 'right' ? 1 : -1;

    if (blocked) {
      victim.hp = Math.max(0, victim.hp - Math.ceil(damage * 0.15));
      victim.stunUntilMs = this.timeMs + 140;
      victim.vel.x = dir * knockback * 0.4;
      attacker.meter = Math.min(100, attacker.meter + 2);
      this.events.push({ atMs: this.timeMs, type: 'block', source: attacker.side });
      return;
    }

    victim.hp = Math.max(0, victim.hp - damage);
    victim.stunUntilMs = this.timeMs + hitstunMs;
    victim.currentMove = null;
    victim.stance = 'hit';
    victim.vel.x = dir * knockback;
    if (launch) victim.vel.y = -420;
    attacker.meter = Math.min(100, attacker.meter + 8);
    victim.meter = Math.min(100, victim.meter + 4);

    this.sprayBlood(victim, kind === 'mercy' ? 14 : 7);
    this.events.push({
      atMs: this.timeMs,
      type: 'hit',
      source: attacker.side,
      payload: { damage, victim: victim.side, kind },
    });

    if (kind === 'mercy' && victim.hp <= 0) {
      this.events.push({ atMs: this.timeMs, type: 'decapitation', source: attacker.side });
    }

    if (victim.hp <= 0) {
      victim.stance = 'ko';
      attacker.stance = 'victory';
      this.roundOver = true;
      this.winnerSide = attacker.side;
      this.events.push({ atMs: this.timeMs, type: 'ko', source: attacker.side });
      this.events.push({ atMs: this.timeMs, type: 'round-end', source: 'system' });
    }
  }

  private sprayBlood(victim: FighterRuntime, count: number): void {
    for (let i = 0; i < count; i++) {
      this.blood.push({
        id: this.nextId++,
        pos: { x: victim.pos.x + rand(-20, 20), y: victim.pos.y - 90 + rand(-30, 30) },
        vel: { x: rand(-160, 160), y: rand(-260, -60) },
        expiresAtMs: this.timeMs + 600 + rand(0, 300),
      });
    }
  }

  private spawnProjectile(
    f: FighterRuntime,
    projectileId: string,
    damage: number,
    hitstunMs: number,
    knockback: number,
  ): void {
    const spec = PROJECTILES[projectileId as keyof typeof PROJECTILES];
    if (!spec) return;
    const dir = f.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.nextId++,
      projectileId,
      ownerSide: f.side,
      sprite: spec.sprite,
      pos: { x: f.pos.x + dir * 60, y: f.pos.y - 100 },
      vel: { x: dir * spec.speedX, y: spec.arcY },
      damage,
      hitstunMs,
      knockback,
      expiresAtMs: this.timeMs + spec.lifetimeMs,
      dead: false,
    });
    this.events.push({
      atMs: this.timeMs,
      type: 'projectile-spawn',
      source: f.side,
      payload: { projectileId },
    });
  }

  private updateProjectiles(dt: number): void {
    const gravityArc = (p: ProjectileRuntime): number =>
      p.projectileId === 'cucumis' || p.projectileId === 'turd' || p.projectileId === 'rock'
        ? GRAVITY * 0.55
        : 0;

    for (const p of this.projectiles) {
      p.pos.x += p.vel.x * dt;
      p.vel.y += gravityArc(p) * dt;
      p.pos.y += p.vel.y * dt;

      if (p.pos.y >= GROUND_Y - 10 && p.vel.y > 0) {
        p.dead = true;
        this.sprayBlood({ pos: { x: p.pos.x, y: GROUND_Y - 40 } } as FighterRuntime, 4);
      }
      if (this.timeMs >= p.expiresAtMs || p.pos.x < -80 || p.pos.x > ARENA_WIDTH + 80)
        p.dead = true;

      if (!p.dead) {
        const target = this.fighters[p.ownerSide === 'p1' ? 'p2' : 'p1'];
        const rect = this.bodyRect(target);
        const pr: Rect = { x: p.pos.x - 24, y: p.pos.y - 24, w: 48, h: 48 };
        if (target.hp > 0 && rectsOverlap(pr, rect)) {
          p.dead = true;
          const owner = this.fighters[p.ownerSide];
          this.applyHit(owner, target, p.damage, p.knockback, p.hitstunMs, false, 'projectile');
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.dead);
  }

  private updateBlood(dt: number): void {
    for (const b of this.blood) {
      b.vel.y += GRAVITY * dt;
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
    }
    this.blood = this.blood.filter((b) => this.timeMs < b.expiresAtMs);
  }

  private checkRoundEnd(): void {
    for (const f of Object.values(this.fighters)) {
      if (f.hp <= 0 && !this.roundOver) {
        this.roundOver = true;
        this.winnerSide = f.side === 'p1' ? 'p2' : 'p1';
      }
    }
  }

  private applyPhysics(f: FighterRuntime, dt: number): void {
    f.pos.x += f.vel.x * dt;
    f.pos.y += f.vel.y * dt;
    if (f.pos.y < GROUND_Y) f.vel.y += GRAVITY * dt;
    if (f.pos.y >= GROUND_Y) {
      f.pos.y = GROUND_Y;
      f.vel.y = 0;
      f.jumpCount = 0;
    }
    f.vel.y = Math.min(f.vel.y, MAX_FALL_SPEED);
    f.pos.x = clamp(f.pos.x, WALL_MARGIN, ARENA_WIDTH - WALL_MARGIN);
  }

  snapshot(): EngineSnapshot {
    return {
      p1: this.fighters['p1'],
      p2: this.fighters['p2'],
      projectiles: [...this.projectiles],
      blood: [...this.blood],
      events: [...this.events],
      timeMs: this.timeMs,
      roundOver: this.roundOver,
      winnerSide: this.winnerSide,
    };
  }

  drainEvents(): CombatEvent[] {
    const ev = this.events;
    this.events = [];
    return ev;
  }
}

function pressed(cur: InputState, prev: InputState, key: keyof InputState): boolean {
  return cur[key] && !prev[key];
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
