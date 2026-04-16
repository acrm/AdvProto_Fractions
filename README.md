# Phase Dominion Prototype

A seasonal multi-faction strategy prototype built with React 19 + TypeScript + Vite.

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Type Check

```bash
npm run typecheck
```

## Deploy

Push to `main` branch. GitHub Pages deploys automatically via Actions.

Enable GitHub Pages:
1. Go to repository Settings → Pages.
2. Set source to "GitHub Actions".

Public URL: `https://acrm.github.io/AdvProto_Fractions/`

## Setting Docs

- `docs/LORE.md` — world premise and tone.
- `docs/FACTIONS.md` — faction bibles and player guild role.
- `docs/LOCATIONS.md` — recurring frontier locations.
- `docs/VECTOR_SEMANTICS.md` — diegetic interpretation of simulation axes.
- `docs/NARRATIVE_LAYER.md` — rules for concise atmospheric storytelling.

## Architecture

Clean/DDD layers:
- `domain/` — pure business rules
- `application/` — use-cases and state (Zustand)
- `infrastructure/` — localStorage adapters
- `presentation/` — React components

## Current Prototype Features

- Seasonal loop with deterministic seeded simulation.
- 5 major frontier factions plus the player-run Grey Lantern Guild in the default baseline.
- 3 to 5 objectives generated per faction each season.
- Objective conflict classes: compatible, contested, mutually-exclusive.
- Full single-screen tactical interface.
- Left tactical column split into live phase chart above and command planning below, with the intelligence panel on the right.
- Diagram plus side panel are constrained to the full viewport without page scrolling on desktop.
- Player-centered interactive phase board with cursor-centered zoom, pan, and faction selection.
- Deep cursor-centered zoom with corrected pointer-space mapping for dense cluster inspection.
- Non-player factions start with distinct initial phase offsets around the player origin.
- Resource-scaled faction dots with trajectory tails.
- Direct player control through a star-shaped five-vector command interface with deterministic forecast.
- Font Awesome faction icons across legend, faction cards, and target tokens.
- Seeded random initial target assignment across the five vector components, with drag-and-drop swap behavior between occupied vertices.
- Seasonal doctrine concept documented as an advisory recommendation layer.
- Explicit player override authority for doctrine divergence and tactical pivots.
- Intel and deception signals designed to justify mid-season recommendation changes.
- North Gate narrative layer with faction doctrines, named locations, contact-sourced intel, and atmospheric session aftermath text.

## PWA

- Installable on desktop and mobile.
- Works offline after first load (app-shell cached by service worker).
- Manifest configured for standalone mode.

## Versioning

Version format: `<weekCode>-<minor>.<build>`

```bash
npm run bump:build -- --desc "description"
npm run bump:minor -- --desc "description"
```