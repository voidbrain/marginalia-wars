/**
 * Shared full-canvas layered SVG rigs for the four marginalia fighters.
 * Each body and weapon/gesture arm uses the same 240×260 canvas so they stay
 * aligned while the arm rotates around its shoulder pivot.
 */
export interface PartFrame {
  readonly src: string;
  readonly w: number;
  readonly h: number;
  readonly ax: number;
  readonly ay: number;
  readonly ox: number;
  readonly oy: number;
  readonly footOff?: number;
}
export interface CharacterParts {
  readonly idle: PartFrame;
  readonly attack: PartFrame;
  readonly arm?: PartFrame;
  readonly fullCanvas?: boolean;
}
export interface RigVars {
  readonly height: number;
  readonly aspect: number;
  readonly footOff: number;
  readonly ax: string;
  readonly ay: string;
}
const W = 240;
const H = 260;
const FOOT_OFF = 30;
const SHOULDER_X = 90;
const SHOULDER_Y = 145;
function frame(src: string): PartFrame {
  return { src, w: W, h: H, ax: SHOULDER_X / W, ay: SHOULDER_Y / H, ox: 0, oy: -85, footOff: FOOT_OFF };
}
function rig(id: string): CharacterParts {
  const body = frame(`assets/sprites/${id}-body.svg`);
  return {
    idle: body,
    attack: body,
    arm: frame(`assets/sprites/${id}-arm.svg`),
    fullCanvas: true,
  };
}
export function rigVarsOf(parts: CharacterParts): RigVars {
  const f = parts.idle;
  const footOff = f.footOff ?? 0;
  const height = (170 * f.h) / (f.h - footOff);
  return {
    height,
    aspect: f.w / f.h,
    footOff: (height * footOff) / f.h,
    ax: `${((parts.arm?.ax ?? 0.5) * 100).toFixed(2)}%`,
    ay: `${((parts.arm?.ay ?? 0.5) * 100).toFixed(2)}%`,
  };
}
export const CHARACTER_PARTS: Record<string, CharacterParts> = {
  rabbit: rig('rabbit'),
  nun: rig('nun'),
  knight: rig('knight'),
  jester: rig('jester'),
};
export function partsFor(fighterId: string): CharacterParts | null {
  return CHARACTER_PARTS[fighterId] ?? null;
}
export type ArmPhase = 'windup' | 'launch' | 'recover';
export function armPhaseOf(
  stance: string,
  moveElapsedMs: number,
  startupMs: number,
  activeMs: number,
): ArmPhase | null {
  if (stance !== 'attack' && stance !== 'special' && stance !== 'mercy') return null;
  if (moveElapsedMs < startupMs) return 'windup';
  if (moveElapsedMs <= startupMs + activeMs) return 'launch';
  return 'recover';
}
