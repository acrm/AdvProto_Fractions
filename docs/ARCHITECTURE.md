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

## Persistence Strategy

- `localStorage` for client-side persistence.
- Adapters in `src/infrastructure/persistence.ts`.
- Domain objects are serialized/deserialized through infrastructure only.
