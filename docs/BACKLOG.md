# Marginalia Fighters backlog

Current work ledger, reviewed 29 October 2026 against main `1ba72ac5` (merged #7). Records opened on that date come from the [baseline audit](audits/2026-10-29.md) made when the agent harness was added. Closed items and their PR history move to [the archive](archive/README.md). IDs are stable: do not reuse them.

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

**Next action / closure evidence:** `.github/workflows/deploy.yml` and `.github/workflows/deploy-gh-pages.yml` are identical (same name, both on push to `main`, same `pages` concurrency group), so each push queues two deploys to `gh-pages`; `.gh-workflow/deploy-gh-pages.yml` is a third, unused copy. Next: keep `deploy-gh-pages.yml` (the one docs/DEPLOYMENT.md names), delete the other two, check the next push runs one deploy. Closes on one deploy run per push.

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

### B-005

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-005 | 🔶 P2 | Open | GAME-DESIGN tables disagree with the move tables |

💻 **→ Human action required: No**<br />Regenerate the GAME-DESIGN tables from `domain/moves/moves.ts`.

**Next action / closure evidence:** docs/GAME-DESIGN.md lists frame data in 60 fps frames with its own move names and damage (for example Cooperus "Spear Jab (F) 6/4/8, 6 dmg"); the code uses milliseconds from shared builders (`rabbit-poke` "Spear Poke", `LIGHT_PUNCH` 90/80/140 ms, 6 dmg). Next: rewrite the tables from the code in milliseconds, or add a small script that prints them, and note the unit. Closes when every move in the code appears in the doc with matching numbers.

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
| 🔴 | B-007 | 🔹 P3 | Open | ART-DIRECTION palette and fonts disagree with the code |

🧑 **→ Human action required: Yes**<br />Decide whether the art doc or the shipped values are the intended look.

**Next action / closure evidence:** docs/ART-DIRECTION.md gives parchment `#e8d9a8`, ink `#2b1b0e`, rubric red `#a52a1a`, gold `#c9a227` and Cormorant for body text; the code ships `#e2c98d`, `#2a1608`, `#7a1f16`, `#b8934f`, MedievalSharp body and UnifrakturCook rubrics, and does not load Cormorant. The style guide documents the shipped values. Next, after the decision: align the losing side and keep one palette table (the style guide), linked from ART-DIRECTION. Closes when the two documents and the code agree.

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

### F-005

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-005 | 🔶 P2 | Implemented | Agent harness: AGENTS, backlog, style guide, checks |

💻 **→ Human action required: No**<br />Open the PR and reconcile this record with its first CI run.

**Next action / closure evidence:** Added from the project harness (`~/Projects/project-harness`): AGENTS.md and CLAUDE.md, area notes, this backlog and its rules, the style guide, the baseline audit, `check:backlog`, `check:freshness`, `ci:status`, `check:conventions`, the `CI` workflow for pull requests; subagents and Copilot instructions now point to AGENTS; the ESLint rule requiring explicit OnPush was replaced. Next: open the PR, confirm the `CI` jobs run (conventions shows B-003 without blocking; unit tests and build depend on B-001 only locally). Closes when the PR merges with a green `check` job.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-29 |
| Verification | Documentation: `check:backlog` and `check:freshness` run locally, 2026-10-29. CI: Pending |
| Reviewed | 2026-10-29 |

</details>

---

## Other changes

None yet.
