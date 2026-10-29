You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Angular pitfalls

- In an `effect()`, read every signal before any guard or optional call (`const on = this.spin(); if (r) r.spin = on`). A signal read behind a false guard, or as an argument of `this.r?.f(this.sig())` while `r` is missing, is never tracked and the effect never re-runs (`check:conventions` flags the second form).
- Signals in `effect()` that write other signals are fine in v22, but wrap reads you do not want tracked in `untracked()`.
- Bind sizes with units (`[style.height.px]`); a unit-less `[style.height]` is ignored.
- Emulated encapsulation does not apply a component's CSS to projected content: layout CSS for projected children lives in the component that owns them.

## Project conventions (Marginalia Fighters)

The game is **Marginalia Fighters** (*Pugna ad Marginem*): a 2D fighting game set in the margins of medieval manuscripts. The repository is `voidbrain/marginalia-wars`, the Angular project `marginalia-fighters`, and the site lives at `https://voidbrain.github.io/marginalia-wars/` (the deploy workflow builds with `--base-href /<repo>/` and pushes `dist/marginalia-fighters/browser` to the `gh-pages` branch; see the README, "Deploying to GitHub Pages").

### Architecture

- `src/app/domain/` and `src/app/data/` are plain TypeScript: no `@angular/*` imports and no browser APIs (`window`, `document`, timers). ESLint (`no-restricted-imports`) and `npm run check:conventions` enforce the imports; never silence either, move the code instead. Game rules live only there, so they stay unit-testable with Vitest and no DOM.
- `CombatEngine` (`domain/combat/combat-engine.ts`) owns the fight: physics, hitboxes from frame data, blocking, meter, projectiles, blood, KO. The UI reads `snapshot()` and `drainEvents()`; it never computes a rule. The engine must be deterministic: the same inputs and the same `dt` sequence give the same result (randomness goes through an injected, seedable source; see B-004).
- The arena page (`pages/arena/arena.ts`) runs the only game loop: `requestAnimationFrame` → `InputService` / `CpuService` input states → `engine.tick(dt)` → `snapshot.set(engine.snapshot())` → drain events once per frame for banners and FX. Never tick from `setTimeout` or an `effect()`.
- The app is zoneless (`provideZonelessChangeDetection()`): no `zone.js`, no `NgZone`. Keyboard and rAF handlers write signals directly.
- `GameStore` (`store/game.store.ts`) holds meta state (phase, picks, wins, stage); the arena keeps fight state in local signals. Components are presentational: they take plain snapshot values through `input()` and emit nothing game-mechanical.
- Move timings are milliseconds (`MoveTiming`: startup / active / recovery); positions are stage pixels.

### Style guide

- Before any UI change (templates, styles, user-facing text, sprites) read [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md) (look, voice and art direction). Use the `var(--…)` tokens from `src/styles.scss`; a new colour is a new token, never a new literal.
- A new token, font or shared component updates the style guide in the same change.

### Adding things

- **A fighter**: an entry in `data/characters.data.ts`, a move table in `domain/moves/moves.ts` with its own normals, special (50 meter), mercy (100 meter), projectile and Latin captions (copying another fighter's set is a defect), sprites in `public/assets/sprites/` (and a rig in `domain/characters/parts/frames.ts` if it has layered art), its row in the fighters table of [docs/GAME-DESIGN.md](docs/GAME-DESIGN.md) and the README roster, and engine specs for its hit, block, meter gating and KO.
- **A move or mechanic**: the rule in the engine or the numbers in the move table, a spec in `combat-engine.spec.ts`; a new or changed rule (not a number) is described in GAME-DESIGN.
- **A stage**: `data/stages.data.ts` and a 960×540 background in `public/assets/backgrounds/`.
- **An interactive element**: a stable `data-testid` (Playwright depends on them: `cpu-toggle`, `fight-btn`, `arena`, `hud`, `timer`, …).

### Checks before you finish

Open every PR against `main`.

```bash
npm run check:freshness   # first, at session start: backlog behind main, merged branches, audit age
npm run lint              # angular-eslint, typescript-eslint, prettier rules, the framework-free domain
npx ng test --watch=false # Vitest: the combat engine
npx ng build
npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters
npm run check:backlog     # active record layout and lifecycle cues
npm run check:conventions # Angular conventions above, framework-free domain/data, unused exports
npm run e2e               # Playwright: navigation and combat (starts ng serve on port 4300)
```

- `check:conventions` reports problems in code written before the harness (B-003); CI shows them without blocking until that record closes. Do not add new ones.
- A test that fails because the code changed is stale: fix the test deliberately and say why.
- Do not leave dead code behind when replacing a feature: its state, helpers, sprites and tests go too.

### Testing the joins

- A change that touches how two parts meet gets a test across both: engine events and the arena's banners and FX, the CPU's inputs and the engine's rules, a rig's frame data and the fighter's layers.

### Known pitfalls

- `node_modules/`, `dist/` and `.angular/` are tracked in git (B-001), and the tracked `node_modules` was installed on another platform: locally `ng test` and `ng build` fail with an esbuild platform error until you reinstall. Never commit changes under those folders.
- The arena opens with a 1.6 s *PUGNA!* intro during which input is ignored: tests disable the CPU (`cpu-toggle`) and wait it out before measuring.
- Opening `/arena` without a selection bounces back to `/select`.

## Area notes

Before changing an area, read its section in [docs/agents/areas.md](docs/agents/areas.md): the rules and lessons there are as binding as this file. Each area has a subagent in `.claude/agents/`.

| Area | Owner | Covers |
|---|---|---|
| Combat engine and moves | `gameplay-engineer` | `domain/`, `data/`: engine, frame data, projectiles, meter, determinism, CPU-relevant mechanics |
| Angular UI | `frontend-angular` | `components/`, `pages/`, `store/`, `services/`, routing, the game loop, styles |
| Art and assets | `artist-assets` | `public/assets/`, sprite rigs, `tools/gen_sprites.py`, provenance |
| Browser tests | `e2e-qa` | `e2e/`, Playwright config, test hooks |
| Build and deploy | — | CI, GitHub Pages, repository hygiene |

## Content

- The tone is grotesque, ironic medieval parody (Luttrell Psalter, *Inkulinati*): cartoonish ink, flat red splats, never photorealistic gore. Source imagery belongs to its creators; keep provenance (see Art and assets).

## Work tracking

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, in the session's first PR:
- the backlog is behind `main`: read the CI of the PRs merged since (`npm run ci:status -- <numbers>`), update or close their records, archive closed ones, move the header to the current `main`;
- merged branches are still on GitHub: delete them (and their local branches and worktrees);
- the newest audit in `docs/audits/` is more than 7 days old: audit what changed since (docs, tests, style guide and art, accessibility, privacy such as metadata in images) and write `docs/audits/<date>.md`;
- the harness template has a newer release (`.harness.json` names the one this project is on), or its clone is missing, behind or unreachable: pull it first (`git -C ~/Projects/project-harness pull --ff-only --tags`), reconcile as its `APPLY.md` ("Reconciling") says, then move `version` forward. A copied tool under `tools/` is never edited here: its settings are in `.harness.json` (the framework-free folders for `check:conventions`, the CI workflow for `ci:status`).

CI prints the same as warnings on every PR (it never blocks). `ci:status` needs a logged-in `gh`; if it is not, say so instead of skipping the step.

- [docs/BACKLOG.md](docs/BACKLOG.md) is the source of truth for status; [docs/BACKLOG-RULES.md](docs/BACKLOG-RULES.md) is the procedure (statuses, human-action cues, record layout, CI reconciliation, closure and archives, documentation ownership and the consistency check every PR records). Update the affected records in the same PR as the change, and run `npm run check:backlog`.
- Keep a confirmed bug, a candidate fix awaiting review, an unimplemented feature and a completed check distinct. A merge is not verification, and a passing unit test is not a verified visual or input fix. A green CI run establishes the checks it named, not the absence of bugs. Archives (`docs/archive/`) and audits (`docs/audits/`) are dated evidence, not current status; the current audit is the newest file in `docs/audits/`.
- A request that changes a copied tool, or adds a rule that would hold for every project, is a harness change: make it in the template first, then reconcile here, as the template's `APPLY.md` ("Changing the harness from a project") says. Settings and project content in adapted files (this file's project conventions, the area notes, the style guide, GAME-DESIGN) stay here.
