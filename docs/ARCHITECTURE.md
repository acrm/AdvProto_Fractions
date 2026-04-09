# Architecture

This project follows Clean/DDD architecture with strict dependency boundaries.

## Folder Responsibilities

| Layer | Path | Responsibility |
|-------|------|---------------|
| Domain | `src/domain/` | Entities, value objects, pure TS business rules |
| Application | `src/application/` | Use-cases, state stores, app services |
| Infrastructure | `src/infrastructure/` | Storage adapters, external integrations |
| Presentation | `src/presentation/` | React components and pages only |

## Dependency Direction

```
presentation → application → domain
infrastructure ← application (via interfaces)
```

## State Ownership

- State is owned by the Application layer via Zustand stores.
- Persistence is handled by Infrastructure (localStorage adapters).
- Presentation reads state via hooks; never writes directly to storage.

## Current System Modules

### Domain
- `src/domain/gameModel.ts` defines core entities and value ranges.
- `src/domain/gameRules.ts` contains deterministic seasonal/session transition logic.

### Application
- `src/application/useGameStore.ts` orchestrates game commands and state lifecycle.

### Infrastructure
- `src/infrastructure/seededRandom.ts` provides deterministic pseudo-random generation.
- `src/infrastructure/persistence.ts` persists `GameState` snapshots.

### Presentation
- `src/presentation/pages/HomePage.tsx` hosts the game shell.
- `src/presentation/components/PhaseSpaceChart.tsx` renders five-axis faction states.
- `src/presentation/components/SeasonStatusPanel.tsx` exposes current campaign status.

## Session Pipeline

1. Player selects a strategy posture in Presentation.
2. Application store dispatches `playNextSession`.
3. Domain resolves vectors, objectives, conflicts, intel, and relationships.
4. Infrastructure persists updated `GameState`.
5. Presentation re-renders from new immutable state snapshot.

## Persistence Strategy

- `localStorage` for client-side persistence.
- Adapters in `src/infrastructure/persistence.ts`.
- Full campaign state is stored under a dedicated game storage key.
