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

- Core simulation state is owned by the Application layer via Zustand stores.
- Doctrine recommendation state is generated in Domain and exposed via Application selectors.
- Player override intent state is owned by Application and persisted with campaign state.
- Persistence is handled by Infrastructure (localStorage adapters).
- Presentation reads state via hooks; never writes directly to storage.
- Divergence telemetry (doctrine vs override) is computed in Application selectors and exported by telemetry adapters.

## Current System Modules

### Domain
- `src/domain/gameModel.ts` defines core entities and value ranges.
- `src/domain/gameRules.ts` contains deterministic seasonal/session transition logic, player intent derivation, and forecast rules.

### Application
- `src/application/useGameStore.ts` orchestrates game commands, selected faction state, player intent state, and forecast lifecycle.

### Infrastructure
- `src/infrastructure/seededRandom.ts` provides deterministic pseudo-random generation.
- `src/infrastructure/persistence.ts` persists `GameState` snapshots.

### Presentation
- `src/presentation/pages/HomePage.tsx` hosts the game shell.
- `src/presentation/components/PhaseSpaceChart.tsx` renders the interactive player-centered phase board.
- `src/presentation/components/CommandPlanningPanel.tsx` hosts the star-shaped command planning UI.
- `src/presentation/components/GameControlPanel.tsx` exports the campaign status, faction roster, and faction focus presentation blocks.
- `src/presentation/components/SeasonStatusPanel.tsx` exposes current campaign status.

## Session Pipeline

1. Player selects a faction on the phase board and sets a five-vector intent in Presentation.
2. Application store reads current doctrine recommendation and updates forecast alongside selected faction state.
3. Application compares doctrine vector and player override intent, then computes divergence indicators.
4. Application store dispatches `playNextSession` using derived strategy plus player intent.
5. Domain resolves vectors, objectives, conflicts, intel, relationships, and next doctrine recommendation.
6. Infrastructure persists updated `GameState`.
7. Presentation re-renders from new immutable state snapshot.

## Persistence Strategy

- `localStorage` for client-side persistence.
- Adapters in `src/infrastructure/persistence.ts`.
- Full campaign state is stored under a dedicated game storage key.
