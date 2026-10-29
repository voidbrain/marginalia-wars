# Marginalia Fighters area notes

Detailed rules and lessons for each part of the game, kept out of AGENTS.md so that file stays short. Read the section of the area you change before you change it; AGENTS.md applies to every task. Keep this file current like AGENTS.md: a change that alters a rule here updates it in the same PR. Each area's subagent in `.claude/agents/` points here instead of repeating these rules.

## Combat engine and moves

Owner: `gameplay-engineer`.

- Code: `src/app/domain/combat/` (engine, types, specs), `domain/moves/moves.ts` (move tables), `domain/characters/` (types, rig frames), `src/app/data/` (roster and stages as typed data).
- No `@angular/*` and no browser APIs here. A lint or `check:conventions` error is fixed by moving the code, never by disabling the rule.
- Deterministic: the same inputs and the same `dt` sequence give the same result. No `Math.random()` inside `tick()` without an injected, seedable source (the blood particles break this today: B-004).
- Frame data lives only in the move tables: `MoveTiming` startup / active / recovery in milliseconds, damage, knockback, hitstun, meter gain and cost, hitbox, projectile. Components read snapshots; they never compute rules.
- Every fighter has a distinct set: normals, special (50 meter), mercy (100 meter), projectile entry and Latin banner captions. Shared builders (`LIGHT_PUNCH` and friends) are fine for the plumbing; the resulting moves must still differ per fighter.
- Each new mechanic gets a spec in `combat-engine.spec.ts` (hit, block, meter gating, KO event). Run `npx ng test --watch=false`.
- [docs/GAME-DESIGN.md](../GAME-DESIGN.md) describes the rules and names where each number lives; it holds no numbers. A change to a rule (blocking, meter, rounds, events) updates it; a change to a number does not.

## Angular UI

Owner: `frontend-angular`.

- Code: `src/app/components/` (fighter, hud, move-banner, scroll-border, stage), `pages/` (home → select → arena → result), `store/game.store.ts`, `services/` (`InputService` keyboard, `CpuService` AI emitting plain input states).
- Zoneless: never `zone.js` or `NgZone.run*`. rAF and keyboard handlers write signals directly.
- The arena's rAF loop is the only place the engine ticks (AGENTS, Architecture). Fight state stays in the arena's local signals; meta state in `GameStore`. Components do not inject state-owning services.
- `Fighter` renders a stacked rig (body plus a separated arm layer on the same canvas) when `parts()` is given, else a single sprite. The attack phase goes down as `data-phase`; the arm keyframes in `fighter/parts/frames.scss` key off it. Rig geometry (canvas size, shoulder pivot, foot offset) comes from `domain/characters/parts/frames.ts` as CSS variables.
- Styles: SCSS with the tokens in `src/styles.scss` (see the [style guide](../STYLE-GUIDE.md)). Inline styles only for dynamic values from the snapshot (positions, widths, rig variables).
- Interactive elements carry a stable `data-testid`.
- Verify with `npm run lint`, `npx ng build` and, for flows, `npm run e2e`.

## Art and assets

Owner: `artist-assets`.

- Style contract: the [style guide](../STYLE-GUIDE.md), Art direction and Visual foundations. Aged parchment, wobbly ink outlines, flat fills, rubric red and gold-leaf accents, comedic violence as decoration. No photorealism, neon or smooth gradients.
- Folders: `public/assets/references/` (source references, kept for provenance), `sprites/` (characters, props, specials, FX), `backgrounds/` (960×540 JPG stages).
- Two pipelines exist side by side: `tools/gen_sprites.py` (PIL, writes contour-cut PNGs: `<char>-idle`, `-body`, `-arm`, `-attack`, `-full`) and hand-made SVG rigs (`<char>-body.svg`, `<char>-arm.svg`) that `parts/frames.ts` uses. Which one is canonical is undecided (F-002); do not delete either set until it is.
- Rig layers share one full canvas (240×260) so they align; the arm rotates around the shoulder pivot in `frames.ts`. Changing the canvas or the pivot changes both the art and the frame data together.
- File names are contracts read by `data/characters.data.ts` and `parts/frames.ts`: rename both sides together.
- Keep provenance for every reference (source URL in the file name or a list next to it). Strip metadata from photos before committing. Keep repository assets under about 8 MB; prefer SVG or quantised PNG.

## Browser tests

Owner: `e2e-qa`.

- Suite: `e2e/navigation.spec.ts` (routes, select screen, CPU toggle) and `e2e/combat.spec.ts` (damage, banner, CPU behaviour). `playwright.config.ts` starts `ng serve` on port 4300 unless a server already answers there; one worker, no parallelism (one shared game instance).
- Determinism: for measurements, uncheck `cpu-toggle` and wait out the 1.6 s intro before acting.
- Locate by `data-testid`; if a hook is missing, add it to the component with a stable name rather than chaining CSS selectors.
- Poll with `expect(...).toPass({ timeout })` or `waitForFunction`; never fixed sleeps before an assertion.
- On a failure read the trace in `playwright-report/` before changing product code, and tell a flake (CPU shoving, intro timing) from a real bug.
- Lesson (B-008): wait for the intro's `announce` to disappear, never a fixed 1.8 s (game time lags wall time on a slow runner); a Playwright `press` lands between two frames, so input must latch taps (`InputService`), and a spec that "flakes" on attacks may be a real input bug.
- Unit specs in `src/app/domain/**/*.spec.ts` stay DOM-free.
- There is no accessibility (axe) coverage yet (F-003).

## Build and deploy

- `.github/workflows/ci.yml` (name `CI`) runs on every pull request: harness checks, lint, unit tests, type check, build, then Playwright.
- `.github/workflows/deploy-gh-pages.yml` deploys on every push to `main` (lint, unit tests, build, `404.html` copy, `.nojekyll`, push to `gh-pages`). `deploy.yml` is an identical second copy and `.gh-workflow/` a third (B-002). See the README, [Deploying to GitHub Pages](../../README.md#-deploying-to-github-pages).
- Dependencies and build output are tracked in git (B-001); never commit changes under `node_modules/`, `dist/` or `.angular/`.
