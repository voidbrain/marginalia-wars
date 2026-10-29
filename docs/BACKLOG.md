# Marginalia Fighters backlog

Current work ledger, reviewed 29 October 2026 against main `a326007f` (merged #11; its CI read with `ci:status`). Records opened on that date come from the [baseline audit](audits/2026-10-29.md) made when the agent harness was added. Closed items and their PR history are in [the archive](archive/backlog-2026-10-29.md). IDs are stable: do not reuse them.

## How to use this file

| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |

Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. Preserve stable IDs and existing user edits.

Each item has a compact summary, followed by its human-action line (icon first: 🧑 **→ Human action required: Yes** = a human is needed, including a decision; 💻 **→ Human action required: No** = agent-owned next action, not completion), then the full-width **Next action / closure evidence**. Expand its details for PR history, dates and verification evidence. A `---` line ends every item.

## Bugs and reliability

### B-001

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-001 | 🔺 P1 | Open | Dependencies and build output tracked in git |

🧑 **→ Human action required: Yes**<br />Decide whether to only untrack the folders or also rewrite history to shrink the repository.

**Next action / closure evidence:** 22,131 tracked files live under `node_modules/`, `dist/`, `.angular/`, `test-results/` and `playwright-report/` ([baseline audit](audits/2026-10-29.md)). The tracked `node_modules` was installed on another platform, so locally `npx ng test` and `npx ng build` fail with an esbuild platform error until it is reinstalled, which then dirties the tree. `.gitignore` now lists the folders, but ignoring does not untrack. Next: `git rm -r --cached` those folders in one PR (files stay on disk), `npm ci`, then confirm `ng test` and `ng build` pass locally. A history rewrite to reclaim space is a separate, destructive step. Closes when the folders are untracked and a fresh clone + `npm ci` builds and tests.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-002

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-002 | 🔺 P1 | Open | Every push to main deploys twice |

💻 **→ Human action required: No**<br />Delete the duplicate deploy workflow and the `.gh-workflow/` copy.

**Next action / closure evidence:** `.github/workflows/deploy.yml` and `.github/workflows/deploy-gh-pages.yml` are identical (same name, both on push to `main`, same `pages` concurrency group), so each push queues two deploys to `gh-pages`; `.gh-workflow/deploy-gh-pages.yml` is a third, unused copy. Next: keep `deploy-gh-pages.yml` (the one the README's Deploying section names), delete the other two, check the next push runs one deploy. Closes on one deploy run per push.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-003

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-003 | 🔶 P2 | Open | Angular conventions not followed by pre-harness code |

💻 **→ Human action required: No**<br />Remove explicit OnPush and move the static blood image to NgOptimizedImage.

**Next action / closure evidence:** `npm run check:conventions` reports 11 problems: `ChangeDetectionStrategy.OnPush` set explicitly in 10 components (the old ESLint rule and `frontend-angular` agent required it; both now follow AGENTS) and a static `<img src>` for the blood splat in `pages/arena/arena.ts`. CI runs the check with `continue-on-error` until this closes. Next: fix all 11, drop `continue-on-error` from `.github/workflows/ci.yml`. Closes when the check passes in CI without the allowance.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-004

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-004 | 🔶 P2 | Open | Combat engine is not deterministic |

💻 **→ Human action required: No**<br />Inject a seedable random source into CombatEngine.

**Next action / closure evidence:** `rand()` in `domain/combat/combat-engine.ts` calls `Math.random()` inside `tick()` for blood particle position, velocity and lifetime, so the same inputs do not give the same snapshot. Next: pass a seedable RNG through the engine options (default seeded per fight), use it in `rand()`, and add a spec that two engines with the same seed and inputs produce equal snapshots. Closes on that spec passing in CI.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-006

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-006 | 🔹 P3 | Open | Components use literal colours instead of tokens |

💻 **→ Human action required: No**<br />Replace literal colours in component styles with tokens.

**Next action / closure evidence:** The five tokens in `src/styles.scss` are used by no component; component SCSS writes about 15 distinct literal colours (`#3a2410` ×14, `#6b5223` ×8, …) and `body` uses `#241708`. Next: add tokens for the recurring values (faded ink, dark lacquer, HP and meter fills, page), use them everywhere, update the style guide's colour table. Closes when `grep -rE '#[0-9a-fA-F]{3,8}' src/app` finds only documented exceptions.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-007

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-007 | 🔹 P3 | Open | Former art-direction palette and fonts disagree with the code |

🧑 **→ Human action required: Yes**<br />Decide whether the art doc or the shipped values are the intended look.

**Next action / closure evidence:** The former docs/ART-DIRECTION.md (merged into the style guide on 2026-10-29) gave parchment `#e8d9a8`, ink `#2b1b0e`, rubric red `#a52a1a`, minium `#c8552a`, gold `#c9a227`, verdigris `#5b7553`, UnifrakturMaguntia display and Cormorant body; the code ships `#e2c98d`, `#2a1608`, `#7a1f16`, `#b8934f`, MedievalSharp body and UnifrakturCook rubrics, and does not load Cormorant. The style guide documents the shipped values and lists the former ones. Next, after the decision: change the tokens and fonts, or drop the former values from the style guide. Closes when the style guide holds one palette and it matches the code.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Art direction merged into docs/STYLE-GUIDE.md: [#9](https://github.com/voidbrain/marginalia-wars/pull/9) |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-008

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-008 | 🔺 P1 | Implemented | Two Playwright specs fail on main |

💻 **→ Human action required: No**<br />Close when the `e2e` job passes on this fix's PR.

**Next action / closure evidence:** The first CI run of the browser suite ([run 40866124177](https://github.com/voidbrain/marginalia-wars/actions/runs/40866124177), PR #8) failed 2 of 9 specs, with retries: `combat.spec.ts` "light attacks damage the idle opponent" (P2 HP stays at 100 %, expected < 99) and `navigation.spec.ts` "walking moves p1 horizontally" (`getByTestId('fighter-p1').locator('.sprite')` matches 2 elements since the layered rig of #6 renders body and arm as `.sprite`). Next: locate the fighter by its host box (or `.sprite:not(.arm)`), and find whether light attacks no longer connect (hitbox versus the new rig offsets) or the spec's timing is stale; fix the cause and say which. On [#10](https://github.com/voidbrain/marginalia-wars/pull/10) ([run 40869707332](https://github.com/voidbrain/marginalia-wars/actions/runs/40869707332)) only "walking moves p1 horizontally" failed and the light-attack spec passed, so that one may be flaky rather than broken: run it repeatedly before changing it. Closes when the `e2e` job passes on a PR. Fixed 2026-10-29: the walking spec reads the fighter's `left` (the engine x) instead of the rig's several `.sprite` layers; every spec waits for the intro's announcement to disappear instead of sleeping 1.8 s (the arena caps a frame at 50 ms, so on a slow runner game time lags wall time); Escape is pressed once the arena exists (on #11 it sometimes reached /select first). The light-attack failure was a real input bug: `InputService` sampled held keys once per frame, so a key pressed and released between two frames was lost (every Playwright `press`, and a fast tap on a slow frame); it now latches presses until the next snapshot. HUD HP bars have `hp-p1` / `hp-p2` hooks. Locally (fresh install outside the tracked `node_modules`): the light-attack spec failed 3 of 5 runs before the input fix; the whole suite then passed 27 of 27 runs with retries off.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#8 CI](https://github.com/voidbrain/marginalia-wars/actions/runs/40866124177): `check` success, `e2e` failure |
| Opened | 2026-10-29 |
| Verification | Browser: whole suite 3× with no retries, 27/27, 2026-10-29. CI: Pending |
| Reviewed | 2026-10-29 |

</details>

---

## Features and improvements

### F-001

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-001 | 🔺 P1 | Open | Refactor and update the game |

🧑 **→ Human action required: Yes**<br />Define the goals and scope of the planned refactor.

**Next action / closure evidence:** The owner plans a heavy refactor and update after the harness lands. Its goals are not recorded yet. Next: the owner lists the goals (gameplay, art, architecture, dependencies); an agent splits them into records here with acceptance checks. The hygiene records (B-001 … B-007, F-002 … F-004) are candidates for its first steps.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-002

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟠 | F-002 | 🔶 P2 | Investigate | Choose the canonical sprite pipeline |

🧑 **→ Human action required: Yes**<br />Choose PNG generation, hand-made SVG rigs, or both with defined roles.

**Next action / closure evidence:** Two pipelines coexist in `public/assets/sprites/`: `tools/gen_sprites.py` writes PNGs (`<char>-idle/-body/-arm/-attack/-full.png`), while `domain/characters/parts/frames.ts` loads SVG rigs (`<char>-body.svg`, `<char>-arm.svg`) and `data/characters.data.ts` still names the PNGs. The artist agent described a third, reference-keying pipeline. Next: after the decision, delete the unused set and its generator, and update the area notes. Closes when one documented pipeline produces every referenced sprite.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-003

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-003 | 🔶 P2 | Open | Accessibility basics: focus, reduced motion, axe |

💻 **→ Human action required: No**<br />Add focus styles, a reduced-motion mode and an axe check in Playwright.

**Next action / closure evidence:** No component styles a visible focus, nothing honours `prefers-reduced-motion` (screen shake, banner, hit flash), and the Playwright suite has no accessibility check. Next: add `:focus-visible` outlines from the tokens, a reduced-motion branch, and `@axe-core/playwright` on home, select and result. Closes when axe passes (WCAG 2.1 A/AA) in CI and the style guide records the focus and motion rules.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-004

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-004 | 🔹 P3 | Open | One name for the project |

🧑 **→ Human action required: Yes**<br />Choose between Marginalia Fighters (package, Angular project) and marginalia-wars (repository, site URL).

**Next action / closure evidence:** The npm package and Angular project are `marginalia-fighters` (build output `dist/marginalia-fighters/`), the repository and Pages URL are `marginalia-wars`. Next, after the decision: rename the losing side consistently (package.json, angular.json, workflows, docs). Closes when one name is used except where a URL must stay.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-006

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-006 | 🔹 P3 | Open | Best-of-3 rounds with meter carried over |

🧑 **→ Human action required: Yes**<br />Decide whether fights should be best-of-3 with meter carried between rounds.

**Next action / closure evidence:** The README promised "best-of-3 rounds, super-meter that carries between rounds", and the former GAME-DESIGN said the same; the game plays one round per fight (`GameStore.finishRound` goes to the result screen) and each fight starts a new engine with 0 meter. The docs now describe what ships. Next, if wanted: round flow in `GameStore` and the arena, meter carried into the next engine, HUD round label, specs. Closes when implemented and covered, or closed as not wanted.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-010

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-010 | 🔹 P3 | Implemented | Harness reconciled to template 1.4.0 |

💻 **→ Human action required: No**<br />Close this record when its PR merges with a green `check` job.

**Next action / closure evidence:** `check:freshness` listed template v1.4.0 (project overrides): `tools/check-harness.mjs` copied (forked files, override markers), the AGENTS Work-tracking bullets reconciled from `core/AGENTS.md`, `.harness.json` on 1.4.0 with an empty `forked`. Closes when the PR merges with a green `check` job.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Script: `check:freshness` (harness on v1.4.0), `check:backlog`, 2026-10-29. CI: Pending |
| Reviewed | 2026-10-29 |

</details>

---

## Other changes

None yet.
