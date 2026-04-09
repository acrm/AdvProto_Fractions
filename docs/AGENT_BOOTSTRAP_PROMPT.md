# Agent Bootstrap Prompt

## Project Overview

AdvProto Fractions is a production-ready Progressive Web App for learning fractions.

**Stack**: React 19 + TypeScript + Vite + Zustand + vite-plugin-pwa

**Architecture**: Clean/DDD with four layers:
- `src/domain/` — pure business rules (Fraction value object)
- `src/application/` — use-cases and state (Zustand stores)
- `src/infrastructure/` — localStorage adapters
- `src/presentation/` — React components and pages

## How to Bootstrap an Agent Session

1. Read `AI_AGENT_INSTRUCTIONS.md` first.
2. Read `docs/ARCHITECTURE.md` to understand layer boundaries.
3. Read `docs/TODO.md` to understand what needs to be done.
4. Run `npm run typecheck` and `npm run lint` to check current state.
5. Pick a TODO item and implement it following the architecture rules.
6. After each change, run `npm run bump:build -- --desc "description"`.

## Key Constraints

- No business logic in `presentation/` layer.
- All TypeScript strict mode — no `any`, no unused variables.
- PWA manifest and service worker must remain functional.
- Version bump after every tracked change.
- Temporary files only in `tmp/` directory.
