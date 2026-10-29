# Game design

How a fight works. The rules live in `src/app/domain/` as plain TypeScript (AGENTS, Architecture); this document describes them and names where each one is. The numbers live only in the code: read them there, and do not copy them here, so they cannot drift (they did: B-005).

| What | Source of truth |
|---|---|
| Move frame data (startup / active / recovery in **milliseconds**, damage, knockback, hitstun, meter gain and cost, hitbox, projectile) | `domain/moves/moves.ts` (shared builders such as `LIGHT_PUNCH` at the top, then one table per fighter) |
| Projectiles (speed, arc, lifetime, sprite) | `PROJECTILES` in `domain/characters/character.types.ts` |
| Roster (names, sprites, captions, quotes) | `data/characters.data.ts`; the player-facing summary is the README roster |
| Stages | `data/stages.data.ts` |
| Hit, block and meter rules | `CombatEngine` in `domain/combat/combat-engine.ts` |
| Round timer and time-out | `ROUND_SECONDS` and the round-end check in `pages/arena/arena.ts` |
| CPU behaviour | `services/cpu.service.ts` |

## A fight

- **One round per fight**, 60 s. It ends on a KO or at time-out, where the higher HP percentage wins. The result screen follows; Rematch starts a new fight with the same picks. `GameStore` counts wins per side across rematches, and the HUD shows them as pips. Best-of-3 rounds is not implemented (F-006).
- **Meter** runs 0–100 and starts at 0 every fight. A clean hit gives the attacker +8 and the victim +4; a blocked hit gives the attacker +2. Specials need and spend 50, mercies 100, both only on the ground.
- **Blocking**: hold away from the opponent. A blocked hit deals `ceil(damage × 0.15)`, a short stun and 40 % knockback. Specials and mercies cannot be blocked.
- **Hits** apply damage, hitstun and knockback, and spray blood (more for a mercy). A move flagged `launch` throws the victim up. A mercy that brings HP to 0 is a decapitation.
- **Projectiles**: spear, cucumis, turd and rock, each with its own speed, arc and lifetime. The dragon, the cavalry charge and the lute are arena FX that play over a special or mercy; their damage comes from the move.
- **Events** the engine emits for the UI: `hit`, `block`, `projectile-spawn`, `special-start` and `mercy-start` (with the banner caption and the FX to play), `decapitation`, `ko`, `round-end`. The arena turns them into banners, FX overlays, splats and shake, draining them once per frame.

## Fighters

Each fighter has a distinct set (AGENTS, Adding things): light and heavy normals, a projectile, a special at 50 meter and a mercy at 100, with Latin banner captions. Their identities (names as in the code; banner captions are `LATIN — gloss`):

| Fighter | Play | Special (50) | Mercy (100) |
|---|---|---|---|
| **The Rabbit on the Snail** (*Domesticus Velox*) | slow mount, long spear reach, thrown lance | Snail Avalanche (*IN CURSU*) | Dragon of the Margin (*DRACO VENIT!*) |
| **The Nun** (*Soror Impudica*) | zoner, cucumis throws | Convent Rebellion (*SORORES IN ARMA!*) | Assumption (*ASSUMPTA EST*) |
| **The Knight** (*Miles Errans*) | armoured pressure, flaming rock | Cavalry Charge (*EQUITES VOLANT!*) | Minstrel Mercy (*MISEREERE*) |
| **The Jester** (*Risus Delebat*) | erratic, dung volley | Rainbow Fart (*IRIS FOETENS*) | Off With Their Heads (*CAPUT REGIS!*), a decapitation |

## CPU

`CpuService` emits the same `InputState` as the keyboard, so the engine cannot tell them apart. Per difficulty (easy, normal, hard) it changes how close it walks, how often it blocks an incoming attack, and how aggressive it is: spending meter on a mercy or special in range, throwing from mid range, otherwise mixing normals, and on normal and hard an occasional jump. It uses `Math.random()`; that is fine outside the engine.

## Tests

- **Vitest** (`domain/combat/combat-engine.spec.ts`, no DOM): spawn and facing, walking, a melee hit with damage and events, block reduction, meter gating (50 / 100), a mercy projectile KO, projectile travel, and the freeze after the round ends.
- **Playwright** (`e2e/`): home, select and fight navigation, walking, the timer, Escape back to select, damage after light attacks, the special's banner, the CPU fighting back. Deterministic specs turn the CPU off and wait out the 1.6 s *PUGNA!* intro. Two fail on `main` (B-008).
