# AdvProto Fractions

A Progressive Web App for learning fractions. Built with React 19 + TypeScript + Vite.

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
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