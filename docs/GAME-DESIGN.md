# Game Design — frame data & systems

All logic lives in `src/app/domain/` as plain TypeScript (no Angular imports; enforced by ESLint). The arena page runs a fixed-timestep-ish rAF loop: read inputs → `engine.tick(dt)` → push immutable snapshot into signals → presentational components render.

## Systems
- **Rounds**: best of 3, 60 s timer, KO or time-out (higher HP% wins).
- **Meter**: 0–100. Gain: dealing/taking damage, blocking, taunt. Special costs 50, Mercy costs 100. Meter carries across rounds.
- **Blocking**: hold away-from-opponent; reduces damage ×0.25, no chip-death, builds block meter-gain.
- **Projectiles**: table-driven arcs (`PROJECTILES` in `character.types.ts`) — cucumber (flat), turd (parabola), dragon (screen-crossing, fire trail), cavalry band (multi-hit sweep).
- **Events**: engine emits `{type:'hit'|'block'|'ko'|'special'|'mercy'|'decapitation', ...}`; UI turns them into banners, splats, shake, sound hooks.

## Move tables (frames @60fps: startup/active/recovery, dmg, knockback)

### Cooperus (rabbit/snail) — slow mount, long reach
| Move | S/A/R | Dmg | Notes |
|---|---|---|---|
| Spear Jab (F) | 6/4/8 | 6 | pokes, cancels into walk |
| Lance Thrust (G) | 12/6/16 | 14 | lunges 40px forward |
| Snail Avalanche (H, 50) | 10/20/18 | 3×8 | shell rolls as low projectile |
| Draco de Margine (J, 100) | 20/-/- | 5×10 | dragon crosses screen, burns |

### Monialis Scandalosa (nun) — zoner
| Move | S/A/R | Dmg | Notes |
|---|---|---|---|
| Cucumis Slap (F) | 5/3/7 | 5 | fast |
| Vespers Smack (G) | 10/5/14 | 12 | |
| Rebellia Monasterialis (H, 50) | 8/12/16 | 10 | throws volley of cucumises |
| Assumptio Posterulae (J, 100) | 14/-/24 | 40 | "Ecce Posterula" heavy cheek hit + arc projectile |

### Miles Irritus (knight) — pressure
| Move | S/A/R | Dmg | Notes |
|---|---|---|---|
| Short Sword (F) | 6/4/9 | 7 | |
| Estoc (G) | 11/6/15 | 15 | |
| Cursus Equitum (H, 50) | 16/30/20 | 4×7 | knights ride L→R on clouds across full stage |
| Misericordia Harpistae (J, 100) | 24/-/30 | 45 | kneels, plays lute; enemy collapses |

### Gelo (jester) — trickster
| Move | S/A/R | Dmg | Notes |
|---|---|---|---|
| Bell Bonk (F) | 4/3/6 | 5 | fastest normals |
| Marotte Swing (G) | 9/5/13 | 12 | hop-forward |
| Crepitus Arcuatus (H, 50) | 8/14/14 | 3×6 | rainbow fart cloud, pushes back |
| Caput Ablatum! (J, 100) | 12/8/26 | 50 | decapitation event → head sprite + splat |

## AI (`services/cpu.service.ts`)
Difficulty tiers emit the same `InputState` objects as the keyboard service: approach when far, random mix of normals in range, block probability vs incoming attacks/hitboxes, spend meter on special/mercy when available, occasional taunt (moral damage).

## Testing strategy
- **Vitest unit**: engine determinism — spawn/facing, walking, hit detection+meter, block reduction, meter gating (50/100), projectile travel, mercy KO events, round-over freeze. No DOM needed.
- **Playwright e2e**: navigation (home→select→arena→result), CPU toggle (`data-testid="cpu-toggle"`), damage after jabs, banner appears on special, CPU fights back. Deterministic specs disable CPU and wait out the 1.6 s "PUGNA!" intro.
