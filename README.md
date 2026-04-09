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

## Architecture

Clean/DDD layers:
- `domain/` — pure business rules
- `application/` — use-cases and state (Zustand)
- `infrastructure/` — localStorage adapters
- `presentation/` — React components

## Current Prototype Features

- Seasonal loop with deterministic seeded simulation.
- 4 active factions in MVP baseline.
- 3 to 5 objectives generated per faction each season.
- Objective conflict classes: compatible, contested, mutually-exclusive.
- Five activity vectors rendered in a phase-space chart.
- Session-level player strategy posture: progress, balanced, sabotage.

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