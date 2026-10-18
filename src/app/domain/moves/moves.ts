import { MoveDef, MoveTiming, moveTotalMs } from '../combat/combat.types';

/** Helper to build a MoveDef with computed total duration. */
export function makeMove(
  id: string,
  name: string,
  caption: string,
  kind: MoveDef['kind'],
  timing: MoveTiming,
  stats: Partial<Pick<MoveDef, 'damage' | 'knockback' | 'hitstunMs' | 'meterGain' | 'meterCost'>> &
    Pick<MoveDef, 'hitbox' | 'projectileId' | 'launch'> = {},
): MoveDef {
  return {
    id,
    name,
    caption,
    kind,
    timing,
    damage: stats.damage ?? 5,
    knockback: stats.knockback ?? 120,
    hitstunMs: stats.hitstunMs ?? 260,
    meterGain: stats.meterGain ?? 6,
    meterCost: stats.meterCost ?? 0,
    hitbox: stats.hitbox,
    projectileId: stats.projectileId,
    launch: stats.launch ?? false,
    totalMs: moveTotalMs(timing),
  };
}

const T = (startupMs: number, activeMs: number, recoveryMs: number): MoveTiming => ({
  startupMs,
  activeMs,
  recoveryMs,
});

/* ------------------------------------------------------------------ */
/* Generic light/heavy used by every fighter (flavor names per char)   */
/* ------------------------------------------------------------------ */

export const LIGHT_PUNCH = (id: string, name: string, cap: string): MoveDef =>
  makeMove(id, name, cap, 'light', T(90, 80, 140), {
    damage: 6,
    knockback: 90,
    hitstunMs: 220,
    hitbox: { x: 30, y: -120, w: 70, h: 40 },
  });

export const LIGHT_KICK = (id: string, name: string, cap: string): MoveDef =>
  makeMove(id, name, cap, 'light', T(110, 90, 170), {
    damage: 8,
    knockback: 130,
    hitstunMs: 260,
    hitbox: { x: 34, y: -70, w: 80, h: 44 },
  });

export const HEAVY = (id: string, name: string, cap: string): MoveDef =>
  makeMove(id, name, cap, 'heavy', T(220, 120, 320), {
    damage: 14,
    knockback: 260,
    hitstunMs: 380,
    meterGain: 10,
    hitbox: { x: 36, y: -130, w: 100, h: 90 },
  });

export const CROUCH_HEAVY = (id: string, name: string, cap: string): MoveDef =>
  makeMove(id, name, cap, 'heavy', T(200, 110, 300), {
    damage: 12,
    knockback: 180,
    hitstunMs: 340,
    meterGain: 9,
    hitbox: { x: 30, y: -40, w: 95, h: 40 },
    launch: true,
  });

export const AIR_ATTACK = (id: string, name: string, cap: string): MoveDef =>
  makeMove(id, name, cap, 'heavy', T(120, 160, 160), {
    damage: 11,
    knockback: 160,
    hitstunMs: 300,
    hitbox: { x: 20, y: -90, w: 80, h: 80 },
  });

/* ------------------------------------------------------------------ */
/* Rabbit of the Snail — spear pokes + snail charge                    */
/* ------------------------------------------------------------------ */

export const RABBIT_MOVES: Record<string, MoveDef> = {
  poke: LIGHT_PUNCH('rabbit-poke', 'Spear Poke', 'PIECE!'),
  swipe: LIGHT_KICK('rabbit-swipe', 'Long Ear Swipe', 'HUFF!'),
  thrust: HEAVY('rabbit-thrust', 'Full Thrust', 'STAB!'),
  lowThrust: CROUCH_HEAVY('rabbit-low', 'Low Thrust', 'UNDERBELLY!'),
  dive: AIR_ATTACK('rabbit-dive', 'Snail Dive', 'SPLAT!'),
  lance: makeMove('rabbit-lance', 'Projective Lance', 'MISSA AD VERSUM!', 'projectile', T(260, 0, 360), {
    damage: 9,
    knockback: 200,
    hitstunMs: 320,
    meterGain: 8,
    projectileId: 'spear',
  }),
  charge: makeMove('rabbit-charge', 'Snail Avalanche', 'IN CURSU — THE SNAIL COMETH', 'special', T(320, 900, 420), {
    damage: 22,
    knockback: 420,
    hitstunMs: 620,
    meterCost: 50,
    meterGain: 0,
    hitbox: { x: -10, y: -110, w: 130, h: 110 },
    launch: true,
  }),
  mercy: makeMove('rabbit-mercy', 'Dragon of the Margin', 'DRACO VENIT! — THE MARGIN WYRM AWAKENS', 'mercy', T(600, 1400, 600), {
    damage: 40,
    knockback: 520,
    hitstunMs: 900,
    meterCost: 100,
    projectileId: 'dragon-fire',
  }),
};

/* ------------------------------------------------------------------ */
/* The Nun — cucumis projectiles, cheeky rear, holy smite              */
/* ------------------------------------------------------------------ */

export const NUN_MOVES: Record<string, MoveDef> = {
  slap: LIGHT_PUNCH('nun-slap', 'Vespers Slap', 'AVE!'),
  kick: LIGHT_KICK('nun-kick', 'Cloister Kick', 'PAENE!'),
  censer: HEAVY('nun-censer', 'Censer Swing', 'THURIBULUM!'),
  moonwalk: makeMove('nun-cheek', 'Moonlit Cheek', 'ECCE POSTERULA!', 'heavy', T(180, 140, 280), {
    damage: 13,
    knockback: 200,
    hitstunMs: 360,
    meterGain: 9,
    hitbox: { x: -110, y: -90, w: 120, h: 70 },
  }),
  hurdy: makeMove('nun-hurdy', 'Hurdy-Burst', 'DEDIT URDYBORDUM!', 'projectile', T(240, 0, 340), {
    damage: 8,
    knockback: 150,
    hitstunMs: 300,
    meterGain: 8,
    projectileId: 'cucumis',
  }),
  special: makeMove('nun-special', 'Convent Rebellion', 'SORORES IN ARMA! — THE CONVENT REVOLTS', 'special', T(420, 800, 460), {
    damage: 20,
    knockback: 360,
    hitstunMs: 560,
    meterCost: 50,
    hitbox: { x: 20, y: -140, w: 150, h: 140 },
  }),
  mercy: makeMove('nun-mercy', 'Assumption', 'ASSUMPTA EST — BODY AND CHEEK TO HEAVEN', 'mercy', T(700, 1200, 700), {
    damage: 38,
    knockback: 480,
    hitstunMs: 900,
    meterCost: 100,
    hitbox: { x: -20, y: -160, w: 220, h: 160 },
    launch: true,
  }),
};

/* ------------------------------------------------------------------ */
/* The Knight — armored pokes + charging cavalry                       */
/* ------------------------------------------------------------------ */

export const KNIGHT_MOVES: Record<string, MoveDef> = {
  punch: LIGHT_PUNCH('knight-punch', 'Gauntlet Punch', 'HRRRNGH!'),
  boot: LIGHT_KICK('knight-boot', 'Sabaton Boot', 'CLANG!'),
  sword: HEAVY('knight-sword', 'Broadsword Cut', 'TAKE THAT!'),
  stab: CROUCH_HEAVY('knight-stab', 'Low Guard Stab', 'FOOTWORK!'),
  jump: AIR_ATTACK('knight-jump', 'Sky Fall', 'DOOM!'),
  fling: makeMove('knight-fling', 'Flaming Rock', 'SIC BRENDET! — FLAMING ROCK AHOY', 'projectile', T(280, 0, 380), {
    damage: 10,
    knockback: 220,
    hitstunMs: 340,
    meterGain: 8,
    projectileId: 'rock',
  }),
  cavalry: makeMove('knight-cavalry', 'Cavalry Charge', 'EQUITES VOLANT! — HORSEMEN ACROSS THE SKY', 'special', T(500, 1100, 500), {
    damage: 26,
    knockback: 460,
    hitstunMs: 700,
    meterCost: 50,
    hitbox: { x: -200, y: -140, w: 600, h: 140 },
    launch: true,
  }),
  mercy: makeMove('knight-mercy', 'Minstrel Mercy', 'MISEREERE — THE LUTE OF FINAL SORROW', 'mercy', T(800, 1600, 800), {
    damage: 45,
    knockback: 300,
    hitstunMs: 1200,
    meterCost: 100,
    hitbox: { x: -40, y: -150, w: 160, h: 150 },
  }),
};

/* ------------------------------------------------------------------ */
/* The Jester — dung volleys and royal decapitation                    */
/* ------------------------------------------------------------------ */

export const JESTER_MOVES: Record<string, MoveDef> = {
  bonk: LIGHT_PUNCH('jester-bonk', 'Marotte Bonk', 'BONK!'),
  flip: LIGHT_KICK('jester-flip', 'Backflip Heel', 'WHEE!'),
  flail: HEAVY('jester-flail', 'Three-Tail Flail', 'JOLLY ROGER!'),
  squat: CROUCH_HEAVY('jester-squat', 'Squall Squat', 'EXTRAHUNT!'),
  volley: makeMove('jester-volley', 'Dung Volley', 'COPRA MITTITUR!', 'projectile', T(220, 0, 320), {
    damage: 7,
    knockback: 120,
    hitstunMs: 280,
    meterGain: 7,
    projectileId: 'turd',
  }),
  rainbow: makeMove('jester-rainbow', 'Rainbow Fart', 'IRIS FOETENS — THE LEPROUS RAINBOW', 'special', T(380, 700, 420), {
    damage: 18,
    knockback: 320,
    hitstunMs: 520,
    meterCost: 50,
    hitbox: { x: -140, y: -120, w: 300, h: 120 },
  }),
  mercy: makeMove('jester-mercy', 'Off With Their Heads', 'CAPUT REGIS! — OFF WITH THEIR HEADS', 'mercy', T(700, 1300, 700), {
    damage: 42,
    knockback: 500,
    hitstunMs: 1000,
    meterCost: 100,
    hitbox: { x: 20, y: -170, w: 160, h: 80 },
  }),
};
