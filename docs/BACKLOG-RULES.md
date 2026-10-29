# Backlog maintenance rules

This is the authoritative update and review procedure for the [Marginalia Fighters backlog](BACKLOG.md). AGENTS and README link here; keep procedural changes here rather than adding competing instructions elsewhere. The backlog's lifecycle table is the status quick reference. Archives and audits preserve dated evidence, not current state.

## When to update and review

- Every code, documentation or asset change and every PR updates the affected bug/feature records. Add a stable ID if needed; maintenance-only changes belong in Other changes. Do not create a new ID for each follow-up PR.
- At PR creation, add its actual link and distinguish implementation, investigation, partial fix and verification. Replace temporary PR placeholders once the PR exists.
- After a PR merges, when CI/verification finishes, when the user supplies acceptance or a new failure, and at the start of work on a related item, reconcile the affected records using the procedure below.
- When asked for backlog status or an audit, review every active record. During ordinary work, review related items and any contradictions encountered; a row's age alone is never evidence that it is fixed, abandoned or invalid.
- These are event-driven agent instructions, not a scheduled background process. Do not claim continuous monitoring or automatic CI updates without an actual automation. The trigger is the session start: `npm run check:freshness` (AGENTS, Work tracking) lists PRs merged since the backlog's commit, merged branches still on GitHub, an audit older than 7 days and a newer harness template release; CI prints the same as warnings on every PR without blocking it.

## Review procedure

1. Read current main and preserve the user's edits. Identify every item affected by the PR/change, including shared dependencies and maintenance records.
2. Check the actual PR target, merged state, commit and CI jobs (`npm run ci:status -- <PR numbers>` lists each job, failed and retried tests, and PRs not based on main). Read failures or selected test results when needed. A merge is not verification; a green workflow only establishes the checks it actually ran. Skipped jobs, mocked devices and captured screenshots do not establish the behaviour they did not test.
3. Compare acceptance requirements, status, next action and verification evidence. Remove obsolete present-tense pending claims after their checks pass; move relevant earlier failures to PR / evidence as labelled history. Record unresolved checks explicitly. If a requirement is ambiguous, investigate rather than invent acceptance or claim closure.
4. Choose the supported state using the lifecycle legend. Implemented means required checks remain. Verified requires all recorded acceptance checks to pass with dated evidence. When no action remains, record the resolution and close/archive; agents need no extra permission unless the item explicitly requires human acceptance. Failed checks return the item to Open/Investigate as appropriate; record a named blocker only when it actually prevents the next action.
5. Reassess Human action required and blockers. Yes means the next action depends on explicit human acceptance, a human decision (choosing an option or a scope), private evidence or real devices. When an agent asks the user to decide before continuing an item, set that item's cue to Yes in the same change, naming the decision; set it back once answered. No means an agent can advance the next step, not that the item is done. Do not require a human for ordinary coding or automated/browser checks. A blocked record states the missing input/dependency and the condition for resuming.
6. Update PR/evidence, verification, next action and Reviewed together. Check related records for contradictions, such as a passed check still described as pending, a Verified item awaiting a required human check, or a completed maintenance change left yellow indefinitely.
7. Validate table structure, markers, links and dates before publishing. Add the actual follow-up PR link, and reconcile again when its checks finish or it merges.

Staleness prompts review, not a status change by itself. During a full review, flag unresolved dependencies, outdated PR placeholders, missing next actions, old pending claims and long-held Verified records. Keep the last honest evidence date if no new check ran; Reviewed may advance only after actually reviewing the record. Do not reset Opened or fabricate implementation/verification dates to make a record look current.

## Record and evidence requirements

- Keep IDs stable and in ID order within each section; never reuse an ID. `B-nnn` is a bug or reliability problem, `F-nnn` a feature or improvement. Opened is the first known date that ID entered the ledger, not a guessed original-report date; preserve it through reopening.
- Each item records a reproducible trigger/request, scope, next action and closure requirements. Active records use a compact five-column summary (Signal, ID, Priority, Status, Item), then full-width **→ Human action required** first and **Next action / closure evidence** second. PR / evidence, Opened, Verification and Reviewed stay in a two-column Field/Value table inside expandable details. This keeps the next action readable without horizontal scrolling; never move it back into the wide metadata table. Priority measures impact: P1 data integrity, reliable CI/build, core behaviour; P2 important workflows and visual defects; P3 enhancements and narrower review.
- PR / evidence identifies actual changes or checks with links and labels. Use `—` if no PR is known. Link the latest relevant evidence without discarding important historical context.
- Verification records date, method, result and evidence separately from Reviewed. Methods: Human, Unit/integration, Browser/accessibility, Real-device and Documentation. Use Pending where applicable; different checks may have different dates. Verification states the current result: one entry per method, the latest check of it. Earlier results (a failure since fixed, a superseded pass) belong in PR / evidence, labelled with their PR or run, so the cell never reads “Pending; … passed” for the same check. A unit test does not prove visual or field behaviour, and an overall CI result does not replace checking which jobs ran.
- Reviewed is when status/evidence were actually reconciled, not an inferred merge date. Preserve existing dated history; do not invent dates.
- The human-action line is a visible paragraph immediately before Next action in every active record, icon first: `🧑 **→ Human action required: Yes**<br />One short sentence naming the human action or decision.` or `💻 **→ Human action required: No**<br />One short sentence naming the agent's next action.` Reassess whenever the next step changes. One manual review can cover related IDs; reference the shared item instead of implying separate approvals. A `---` line follows every record's details.

## Visual cues and table integrity

| Cue | Rule |
|---|---|
| First-column status | 🔴 Open · 🟠 Investigate · 🟡 Implemented · 🟢 Verified · 🟣 Blocked · 🔵 Closed; match the written Status. |
| Active priority | 🔺 P1 · 🔶 P2 · 🔹 P3; keep its written label and value. |
| Closed or Blocked priority | ◻️ P1 / ◻️ P2 / ◻️ P3; only the marker changes. Verified priorities keep their colour until Closed. |
| Reopened or unblocked | Restore the colour for the retained priority; preserve ID, Opened and previous evidence. |

Colour never replaces status text, priority labels or evidence. Table rows must be contiguous: a blank line ends a Markdown table. Every row needs its header's number of cells: five for active summary rows, two for metadata, and the original width in historical archives. Escape literal pipes inside cells. Use `<br />` for an in-cell line break. Keep a blank line before a table and after its last row. Validate all affected rows, not just the added one, and check local links and status/priority consistency. For documentation-only changes these structural checks and a deliberate review are enough; do not invent application test coverage.

## Closure and archives

Close fixes after their recorded criteria pass and no action remains; Verified is a transition, not a permanent holding pen. Human/device acceptance is required only where specified. Cancelled, duplicate or superseded items can close without a verified implementation when the reason and replacement link, if any, are explicit. Do not close a reported bug because one attempt could not reproduce it without recording the investigation and the remaining uncertainty.

Move closed records, including completed maintenance-only changes, into a dated archive (`docs/archive/backlog-<date>.md`) linked from the active ledger. Preserve each complete record (visible actions plus metadata), with original ID/priority, PR history, evidence, resolution and closure date. Historical Closed records keep their closure cues if an item is later reopened; the active record describes the new work and links its prior history.

Closing a documentation audit or recording change does not close a product feature whose checks remain pending. Put that pending work on its own active item rather than keeping the completed maintenance entry yellow indefinitely.

## Documentation consistency

README summarizes capabilities; AGENTS directs repository work, with per-area rules in [docs/agents/areas.md](agents/areas.md); this file owns backlog procedure; BACKLOG holds current records and the quick lifecycle legend; the [style guide](STYLE-GUIDE.md) owns UI, art direction and writing conventions; [GAME-DESIGN](GAME-DESIGN.md) owns the rules of a fight and where each number lives (the numbers themselves live only in code); README also owns deploying; `.claude/agents/` and `.github/copilot-instructions.md` point to AGENTS and never override it. User instructions take precedence. Dated archives and audits preserve context and do not override current rules.

When changing shared rules, reconcile linked summaries and scoped exceptions in the same PR. The style guide's no-emoji rule covers the application UI: backlog markers are permitted. Keep historical evidence dated rather than rewriting it as current verification.

For **every modification**, including a backlog-only edit, check README, AGENTS and its area notes, BACKLOG, BACKLOG-RULES, the style guide and GAME-DESIGN for affected claims, rules, links and exceptions. Update every affected document in the same PR; do not edit an unaffected file merely to mark it reviewed. Preserve user changes. State the consistency check and any outstanding discrepancy in the PR validation notes. A backlog state change can require README or guide corrections even when code did not change.

On every change or review, actively reassess whether each affected status, next action, human dependency, blocker, verification result/date and PR evidence can advance. When the next action is authorized and feasible, perform it; do not merely rewrite an “Agent can…” reminder or stop at a review. Pause only for an actual dependency or missing required human evidence, record it explicitly, and continue independent authorized work. Never advance a state without the required evidence.

Run `npm run check:backlog` after every ledger edit. CI validates active summary widths, visible next and human actions (icon first, Human action before Next action, a `---` line after the details), metadata fields, date formats, unique IDs, status/priority cues and balanced details. Historical archives stay outside this schema.
