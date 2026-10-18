# Copilot instructions — Marginalia Fighters

Angular 22, **zoneless**, signals-only fighting game about medieval manuscript marginalia.

Non-negotiables:
- `src/app/domain/**` + `src/app/data/**`: pure TypeScript, zero `@angular/*` imports (ESLint-enforced). Game rules live ONLY there.
- Components: standalone + OnPush + signal `input()` API; presentational only; render immutable engine snapshots.
- No NgZone usage anywhere (app is zoneless). Keyboard/rAF handlers mutate signals directly.
- New characters require fully distinct move sets/specials/mercies/banners (see docs/GAME-DESIGN.md tables) and their own sprites (docs/ART-DIRECTION.md).
- Keep `data-testid` hooks (cpu-toggle, fight-btn, arena) used by Playwright specs.
- Commands: `npm run lint`, `npm test`, `npm run e2e`, `npm run build`. Deploy: gh-pages branch via `.github/workflows/deploy.yml` or `npm run deploy:local` (ngh) — see docs/DEPLOYMENT.md.
- Tone/content: grotesque ironic medieval parody (Inkulinati-like). Cartoonish ink style, never photorealistic gore.
