# Marginalia Fighters style guide

How the game looks and talks, and how this repository's documents are written. Read it before changing UI (templates, component styles, `src/styles.scss`, user-facing text) or art (sprites, stages, FX). The values live in code: the CSS custom properties in `src/styles.scss` (`:root`) and the fonts loaded in `src/index.html`. When this guide and the code disagree, the code is what ships: fix whichever is wrong and record the discrepancy in the backlog if it is not fixed in the same change.

Everything happens inside a medieval manuscript page (*Ad Marginem*). The arena is parchment, the interface is rubrics, initials and gold-leaf banners, and the fighters are marginal doodles come to life. This guide replaces the former `docs/ART-DIRECTION.md`; its palette and font values were dropped because the code ships different ones (B-007).

## Documentation ownership

This guide governs the game's UI, its art direction and repository writing; [GAME-DESIGN](GAME-DESIGN.md) governs rules; [Backlog rules](BACKLOG-RULES.md) govern tracking. Folders, pipelines and file-name contracts for assets are in [Art and assets](agents/areas.md#art-and-assets). Backlog status/priority emoji are documentation cues, not game icons. README describes the game; AGENTS directs implementation. User instructions take precedence.

## Art direction

### Concept

Grotesque, ironic, illustrious: monks letting off steam in the margins. References: the Luttrell Psalter, the *Roman de la Poire*, *The Battle of the Pigs*; modern: *Inkulinati*. Aged yellow card (`public/assets/references/bg-ref-*.jpg`) and a two-ink look: a dark ink line plus one warm fill per region.

### Do and don't

- Do: flat fills, wobbly ink outlines, deliberately "bad" medieval proportion and perspective.
- Do: comedic violence as decoration. Splats are ornaments, like margin beasts eating heads; head and blood sprites (`prop-head`, `blood-splat`) follow manuscript execution miniatures, flat red.
- Don't: photorealism, neon, drop shadows on art, smooth gradients, modern gore.

### Fighters

| Fighter | Art notes | References |
|---|---|---|
| The Rabbit on the Snail | the classic "rabbit hunting" reversal; slow mount, long lance | Redbubble 5456614765.3609 |
| The Nun | a wild Baudry-style nun; cucumis projectiles, the scandalous rear. Manuscript precedent: nuns flipping tables and showing bottoms (*Roman de la Poire* tradition). Ink-line cartoon, never photoreal | — |
| The Knight | armoured duellist; cavalry sweeping left to right over flat Monty Python clouds; the kneeling lute minstrel | Redbubble 3294005445, 5810212304; topwar.ru marginalia cavalry plate |
| The Jester | coprophagic humour from the margins (devils, droppings, head-chopping); rainbow fart, flying head | gstatic thumbnail ANd9GcTPKIcDVBJ… |

### Stages

One parchment vignette per fight (`public/assets/backgrounds/`, 960×540): meadow hunt, castle margin, scriptorium desk, grotesque beast margin, heraldic banner wall. All share foxed corners, a vignette, faint ruling lines and a decorated initial in a corner.

## Content and voice

- **Voice: a mock-solemn scribe.** Latin for headings and the big moments: section titles ("Elige Adversarium", "Locus Proelii"), the incipit and explicit ("Incipit Bellum Marginale", "Explicit Bellum Marginale"), *PUGNA!*, move captions on the banner with a short English gloss beneath.
- **Latin is decorative, never required:** every Latin caption has an English gloss or a plain label nearby ("Sors Letum (random)"), so the game is playable without it.
- **Buttons** are short English imperatives in Title Case with a manuscript flavour: "To the Margin!", "Fight Again", "Rematch", "Choose New Foes", "Return to the Colophon". Keep new ones in that register.
- **Humour is grotesque and affectionate:** manuscript slapstick (bottoms, droppings, severed heads, cucumbers), never cruelty towards real groups and never photorealistic gore.

## Visual foundations

### Colour

Tokens defined in `src/styles.scss`:

| Token | Value | Use |
|---|---|---|
| `--parchment` | `#e2c98d` | page and panel backgrounds |
| `--parchment-light` | `#f3e2b3` | light text on dark or red fills, highlights, selection text |
| `--ink` | `#2a1608` | body text, outlines |
| `--rubric-red` | `#7a1f16` | rubrics, headings, initials, selection background |
| `--gold` | `#b8934f` | gold leaf: banners, meter, selection frames |

The page behind the folio (`body`) is `#241708`, a literal that should become a token.

The component styles do not use these tokens yet: every component writes literal values (about 15 distinct colours, for example `#3a2410` brown ink ×14, `#6b5223` faded ink for hints ×8, the HP bar `#e05c48 → #8c1f14`, the meter `#ffd76a → #b18a2e`, the button `#6b1512 → #3f0d0a`). Moving them to tokens is B-006. Until then:

- New styles use `var(--…)`. A colour without a token gets one, added to `styles.scss` and to this table in the same change.
- Fill and foreground change as a pair: light parchment text on red or dark fills, ink on parchment.
- Contrast meets WCAG AA (4.5:1 for text, 3:1 for large text and HUD bars) on the real background, including over the stage art.
- Red is the rubric: headings, initials, damage and blood. Gold marks what is valuable or selected: banners, meter, the chosen fighter.

The former art-direction palette (parchment `#e8d9a8`, ink `#2b1b0e`, rubric red `#a52a1a`, minium orange `#c8552a`, gold leaf `#c9a227`, verdigris `#5b7553`) differs from these tokens; which is intended is B-007. The tokens above are what ships.

### Type

Loaded from Google Fonts in `src/index.html`:

| Face | Role | Where |
|---|---|---|
| **MedievalSharp** | body text, HUD names and numbers, hints | `body` default, HUD, menus |
| **UnifrakturCook** (700) | rubrics, buttons, timer, banner captions, stage titles | `.rubric`, `.btn`, HUD timer, move banner |
| **UnifrakturMaguntia** | display: the game title, illuminated initials, verdicts | home title and initial, result, arena announcements |

Fallback is `serif` (Georgia for the body). Blackletter is for short display text only; anything longer than a line is MedievalSharp. Sizes on the banner and titles scale with the viewport (`clamp(…)`).

### Spacing and layout

- The arena is a fixed 960×540 stage scaled to the viewport; fighters stand on a common floor line, and sprite heights are fixed (`SPRITE_HEIGHT` 170 px).
- Menus are a centred folio on parchment with a radial vignette.
- There is no spacing scale yet; use multiples of 4 px and record a scale here when one emerges.

### Ornament, borders, shadows

- Panels and frames are scroll or folio shapes (`components/scroll-border`), not cards. Edges are ink lines.
- Gradients are allowed only where gilding or lacquer implies one (buttons, initials, meter and HP fills); backgrounds are flat parchment with a vignette.

### States and motion

- Buttons: hover lightens the lacquer; focus needs a visible ink or gold outline (none exists yet: F-003).
- Fight feedback: hit flash on the fighter, screen shake, blood splats, the gold banner unfurling for specials and mercies. Respect `prefers-reduced-motion` by dropping shake and shortening the banner (not implemented yet: F-003).

## Components

| Component | Source | Notes |
|---|---|---|
| Fighter | `components/fighter/` | single sprite or stacked rig (body + arm); arm keyframes per attack phase in `parts/frames.scss` |
| HUD | `components/hud/` | HP and meter bars per side, win pips, timer, round label; P2 mirrored |
| Move banner | `components/move-banner/` | gold scroll with the Latin caption and an English gloss, unfurled by every special and mercy; a mercy variant. Reference: `public/assets/references/banner-ref.jpg` |
| Scroll border | `components/scroll-border/` | the manuscript frame around pages |
| Stage | `components/stage/` | background art and the stage's Latin title |

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus and an accessible name. The fight itself is keyboard-only (see README, Controls).
- Colour never carries meaning alone: HP and meter also differ by position and shape.
- Fighter and prop images that carry meaning have alt text (the fighter's name); decorative ones (blood, FX) have `alt=""`.
- There are no automated accessibility checks yet (F-003).

## Assets

See [Art and assets](agents/areas.md#art-and-assets) for folders, pipelines, file-name contracts, provenance and size limits.

## Writing in this repository

- Plain English, short sentences, active voice. Say what is, not what might be.
- Name things as the code names them: files, functions and commands in backticks, linked when they are paths.
- Dates are absolute (`2026-10-29`), never "yesterday" or "last week".
- One owner per fact: link to it rather than restating it. AGENTS for how to work, the backlog for status, this guide for look, art and voice, GAME-DESIGN for rules (the code for numbers), README for what the game is.

## Keeping it in step

A change that adds or alters a token, a font, a shared component or the voice updates this guide in the same PR. A doc that disagrees with the code becomes a backlog record.
