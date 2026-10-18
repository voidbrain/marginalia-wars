# Art Direction — *Ad Marginem*

## Concept
Everything happens **inside a medieval manuscript page**. The arena is parchment; the UI are rubrics, initials and marginal doodles. Tone: grotesque, ironic, illustrous — monks letting off steam in the margins (Luttrell Psalter, *Roman de la Poire*, *Battle of the Pigs*, modern ref: *Inkulinati*).

## Palette
| Token | Value | Use |
|---|---|---|
| parchment | `#e8d9a8` → `#d4bc7f` gradients | backgrounds, panels |
| ink | `#2b1b0e` | outlines, body text |
| rubric red | `#a52a1a` | headers, damage FX, blood accents |
| minium orange | `#c8552a` | highlights |
| gold leaf | `#c9a227` | banners, meter, selection frames |
| verdigris | `#5b7553` | rare secondary accents |

Aged-yellow-card reference: `public/assets/references/bg-ref-*.jpg`. Two-ink look: black line + one warm fill per sprite region.

## Typography
- Display/Latin callouts: **UnifrakturMaguntia** (blackletter) via Google Fonts.
- Body/HUD numbers: small-caps serif (`Cormorant` fallback Georgia).
- All special/mercy moves unfurl a **gold scroll banner** with a Latin caption (`components/move-banner`) — reference: `references/banner-ref.jpg`.

## Characters (roster art notes)
1. **Rabbit on snail w/ spear** (*Cooperus*) — classic "rabbit hunting" reversal; mount is slow, lance reach long. Ref: redbubble 5456614765.3609.
2. **The Nun** (*Monialis Scandalosa*) — Baudry-style wild nun; comedy weapons: cucumis projectiles, scandalous rear ("Ecce Posterula"). Manuscript precedent: nuns flipping tables, showing bottoms (e.g., folio of the *Roman de la Poire* tradition). Keep it ink-line cartoonish, never photoreal.
3. **The Knight** (*Miles Irritus*) — armored duellist; special = mounted cavalry sweeping L→R over Monty-Python-style flat clouds; mercy = kneeling lute minstrel. Refs: redbubble 3294005445 / 5810212304, topwar.ru marginalia cavalry plate.
4. **The Jester** (*Gelo*) — coprophagic humour straight from the margins (devils, droppings, head-chopping); rainbow fart special, decapitation mercy with flying head sprite. Ref: gstatic tbn ANd9GcTPKIcDVBJ…

Head-severance & blood sprites (`prop-head.png`, `blood-splat.png`) follow real manuscript execution miniatures — flat red splats, not gore gradients.

## Stages
One parchment vignette per fight (`public/assets/backgrounds/`): meadow hunt, castle margin, scriptorium desk, grotesque beast margin, heraldic banner wall. All share: foxed corners, vignette, faint ruling lines, a decorated initial in a corner.

## Sprite pipeline
Source refs downloaded to `public/assets/references/`; processed with PIL (white-key removal → transparent PNG, sepia pass, edge darkening) into `public/assets/sprites/`. Placeholders are single-frame; when pixel-art sheets arrive, keep filenames and add `_idle/_walk/_atkN` suffixes consumed by `FighterComponent` state map.

## Do / Don't
- ✅ Flat fills, wobbly ink outlines, deliberate "bad" proportion (medieval perspective).
- ✅ Comedy violence as decoration: splats are ornaments, like margin beasts eating heads.
- ❌ Photorealism, neon, drop shadows, smooth gradients, modern gore.
