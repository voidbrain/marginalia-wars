import { MoveDef } from '../combat/combat.types';

export type ProjectileKind = 'spear' | 'cucumis' | 'turd' | 'rock' | 'dragon-fire';

export interface ProjectileSpec {
  readonly id: ProjectileKind;
  readonly sprite: string;
  readonly speedX: number;
  readonly arcY: number;
  readonly lifetimeMs: number;
}

export const PROJECTILES: Record<ProjectileKind, ProjectileSpec> = {
  spear: {
    id: 'spear',
    sprite: 'assets/sprites/prop-spear.png',
    speedX: 620,
    arcY: 0,
    lifetimeMs: 1400,
  },
  cucumis: {
    id: 'cucumis',
    sprite: 'assets/sprites/prop-cucumis.png',
    speedX: 480,
    arcY: -260,
    lifetimeMs: 1500,
  },
  turd: {
    id: 'turd',
    sprite: 'assets/sprites/prop-turd.png',
    speedX: 380,
    arcY: -420,
    lifetimeMs: 1600,
  },
  rock: {
    id: 'rock',
    sprite: 'assets/sprites/blood-splat.png',
    speedX: 420,
    arcY: -340,
    lifetimeMs: 1500,
  },
  'dragon-fire': {
    id: 'dragon-fire',
    sprite: 'assets/sprites/special-dragon.png',
    speedX: 700,
    arcY: 0,
    lifetimeMs: 2200,
  },
};

export type SpecialFxKind =
  | 'cavalry-charge'
  | 'snail-charge'
  | 'convent-revolt'
  | 'rainbow-fart'
  | 'dragon-summon'
  | 'lute-dirge';

export interface CharacterPalette {
  readonly accent: string;
  readonly robe: string;
}

export interface CharacterDef {
  readonly id: string;
  readonly name: string;
  readonly epithet: string;
  /** Latin gloss shown under the name on select screen. */
  readonly gloss: string;
  readonly sprite: string;
  readonly portrait: string;
  readonly maxHp: number;
  readonly walkSpeed: number;
  readonly jumpVelocity: number;
  readonly weight: number;
  readonly bodyWidth: number;
  readonly bodyHeight: number;
  readonly palette: CharacterPalette;
  readonly moves: {
    readonly light1: MoveDef;
    readonly light2: MoveDef;
    readonly heavy: MoveDef;
    readonly crouchHeavy: MoveDef;
    readonly air: MoveDef;
    readonly projectile: MoveDef;
    readonly special: MoveDef;
    readonly mercy: MoveDef;
  };
  readonly specialFx: SpecialFxKind;
  readonly taunt: string;
  readonly winQuote: string;
}
