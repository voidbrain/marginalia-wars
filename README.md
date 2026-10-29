# 🐌 Marginalia Fighters — *Pugna ad Marginem*

> *Multo quam ferrum lingua atrocior ferit* — "The tongue strikes far more brutally than the sword."

A 2D fighting game (Street Fighter II / Mortal Kombat style) set inside the grotesque, ironic and hilarious margins of medieval manuscripts: rabbits on snails with spears, belligerent nuns, duelling knights and coprophagic jesters, rendered on aged yellowed parchment in the spirit of *The Battle of the Pigs*, the Luttrell Psalter margin beasts and *Inkulinati*.

Built with **Angular 22**, **zoneless change detection**, a **signal-based store**, and a strictly separated, framework-free game engine.

---

## ▶ Live demo

Deployed to GitHub Pages from the `gh-pages` branch — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Pushes to `main` run lint + tests + build and publish automatically via `.github/workflows/deploy-gh-pages.yml`; `npm run deploy:local` publishes straight from your machine with `ngh`.

## 🎮 Roster & signature brutality

| Fighter | Style | Special (50% meter) | Mercy (100% meter) |
|---|---|---|---|
| **Cooperus** – Rabbit on Snail | mounted lance charges, slow steed | *Cuniculus Furibundus* – snail avalanche | ***Draco de Margine*** – the manuscript dragon flies in and roasts the enemy |
| **Monialis Scandalosa** – The Nun | cucumis (cucumber) jabs, scandalous hip checks | *Rebellia Monasterialis* | ***Assumptio Posterulae*** – "Ecce Posterula!": moonlit cheek heavy + projectile volley |
| **Miles Irritus** – The Knight | spear & sword pressure, armored advance | ***Cursus Equitum*** – cavalry charge sweeps left→right on Monty-Python clouds | ***Misericordia Harpistae*** – kneels and plays the enemy into Valhalla |
| **Gelo** – The Jester | erratic hops, decapitation hooks | *Crepitus Arcuatus* – rainbow fart special | ***Caput Ablatum!*** – "Off with their heads!" severance + blood splat |

Every character has a completely different move-set, projectile table, banner Latin callouts and mercy animation — no shared specials.

## 🕹 Controls

| Action | Key |
|---|---|
| Move | `A` / `D` (hold away = block) |
| Jump | `W` |
| Crouch | `S` |
| Light attack | `F` |
| Heavy attack | `G` |
| Special (≥50% meter) | `H` |
| Mercy (100% meter) | `J` |
| Taunt | `B` · Back to menu: `Esc` |

CPU opponent toggleable on the select screen; best-of-3 rounds, super-meter that carries between rounds.

## 🏗 Architecture — strong logic/UI separation

```
src/app/
├── domain/            ← PURE TypeScript. Zero @angular/* imports (enforced by ESLint).
│   ├── combat/combat-engine.ts   deterministic CombatEngine class: physics,
│   │                             frame-data hitboxes, blocking, meter, projectiles,
│   │                             blood, KO events. snapshot() / drainEvents().
│   ├── moves/moves.ts            per-character move tables (startup/active/recovery)
│   └── characters/, data/        roster + stages as plain typed data
├── store/game.store.ts  ← root signal() store for meta state (phase, picks, wins)
├── services/            ← InputService (keyboard), CpuService (AI brain emitting
│                          plain InputStates) — thin adapters over the domain
├── components/          ← presentational components (OnPush by default), signal input() API only:
│                          fighter, hud, move-banner (medieval scroll w/ Latin text), stage
└── pages/               home → select → arena (rAF game loop) → result
```

- **Zoneless**: `provideZonelessChangeDetection()`; the arena runs a `requestAnimationFrame` loop feeding the engine and pushing immutable snapshots into signals — Angular re-renders only what changed.
- **Testability**: the engine is a plain class — unit-tested with Vitest without any DOM/Angular harness.
- **ESLint contract**: `no-restricted-imports` bans `@angular/*` inside `domain/` and `data/`, so the separation can never rot.

## 🛠 Dev commands

```bash
npm start          # ng serve
npm run build      # production bundle (~65 kB gz initial)
npm run lint       # angular-eslint + prettier rules
npm test           # vitest unit tests (combat engine)
npm run e2e        # Playwright (navigation + combat specs)
npm run format     # prettier --write
npm run deploy:local  # ngh push to gh-pages branch

npm run check:freshness    # at session start: backlog behind main, merged branches, audit age
npm run check:backlog      # backlog record layout
npm run check:conventions  # Angular conventions, framework-free domain, unused exports
npm run ci:status -- <PR>  # a PR's CI jobs and failed tests (needs gh)
```

Pull requests run all of these in the `CI` workflow (`.github/workflows/ci.yml`).

## 🎨 Art direction & assets

See [docs/ART-DIRECTION.md](docs/ART-DIRECTION.md) and [docs/GAME-DESIGN.md](docs/GAME-DESIGN.md).

Characters/backgrounds are derived from public marginalia artwork references (Redbubble prints, gstatic thumbnails, medieval manuscript scans) processed into transparent sprite sheets (`public/assets/sprites`, `public/assets/backgrounds`) — sepia parchment palette, red/black two-ink rubric styling, gold-leaf banners. Original reference images are kept in `public/assets/references/` for provenance. Sprites are placeholders pending commissioned pixel art; swap files in `assets/sprites/` and everything updates automatically.

## 🤖 Working on it

- [AGENTS.md](AGENTS.md): how to work in this repository, for people and coding agents (Claude Code reads it through [CLAUDE.md](CLAUDE.md); Copilot through `.github/copilot-instructions.md`). Per-area rules are in [docs/agents/areas.md](docs/agents/areas.md), and each area has a subagent in `.claude/agents/` (gameplay-engineer, frontend-angular, artist-assets, e2e-qa).
- [docs/BACKLOG.md](docs/BACKLOG.md): current bugs and features with their status and next action ([rules](docs/BACKLOG-RULES.md)); the newest file in [docs/audits/](docs/audits/) is the current audit.
- [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md): how the game looks and talks (tokens, fonts, voice, accessibility).

## 📜 Credits & disclaimer

Grotesque marginalia inspired by the Luttrell Psalter, *Roman de la Poire*, *Inkulinati* and countless nameless monks with too much time. This is an affectionate parody; all source imagery belongs to its respective creators. No peasants were harmed; several heads were lost.
