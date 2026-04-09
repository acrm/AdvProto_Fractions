# Implementation Plan

## Goal
Deliver a playable MVP of Phase Dominion in the current codebase with clean boundaries and deterministic simulation.

## Principles
- Follow Clean/DDD: presentation -> application -> domain.
- Keep simulation deterministic using a seed-based random source.
- Treat seasonal doctrine as advisory and preserve explicit player override authority.
- Keep all game documents in sync with implementation.

## Workstreams

### 1. Systems Core (Domain)
Status: in progress
- [x] Define game entities and state model.
- [x] Add seasonal/session loop rules.
- [x] Implement objective generation and conflict classes.
- [x] Implement relationship and intel baseline.
- [ ] Add seasonal doctrine generation from objectives, relationships, and trajectories.
- [ ] Add anti-exploit formulas as explicit tunable parameters.
- [ ] Extend deterministic content generation for events, contacts, and frontier incidents.
- [ ] Add domain unit tests for transitions and invariants.

### 2. Application Orchestration
Status: in progress
- [x] Add Zustand game store.
- [x] Add actions for strategy selection and session advance.
- [x] Wire persistence for game state snapshots.
- [x] Invalidate incompatible pre-narrative saves to guarantee canonical faction profiles.
- [ ] Add doctrine vs override divergence selectors.
- [ ] Add doctrine re-evaluation triggers from high-confidence contradictory intel.
- [ ] Add game commands for explicit progress and sabotage targeting.
- [ ] Add selectors for telemetry extraction.

### 3. Presentation Shell
Status: in progress
- [x] Replace fraction page with game shell.
- [x] Add strategy controls and session run action.
- [x] Add phase-space chart with five axes.
- [x] Add status, objective, intel, and log panels.
- [x] Add narrative briefing, faction doctrine, and flavored objective/intel text to the tactical panel.
- [ ] Add seasonal doctrine recommendation panel with override comparison.
- [ ] Add divergence indicators (magnitude and projected cost deltas).
- [ ] Add objective planning UI with target selection.
- [ ] Add relationship graph overlay and conflict inspection view.

### 4. AI Layer
Status: not started
- [ ] Add utility scoring model for non-player factions.
- [ ] Add retaliation and coalition behavior.
- [ ] Add deception policy tied to intel reliability.

### 5. Telemetry and Balancing
Status: not started
- [ ] Emit session-level telemetry events.
- [ ] Compute KPI aggregates for strategy depth and diversity.
- [ ] Track doctrine adherence ratio and divergence magnitude by season.
- [ ] Track intel-driven pivot frequency and pivot quality outcomes.
- [ ] Track playstyle viability parity across doctrine-heavy and doctrine-light runs.
- [ ] Add seed-batch simulation script for balance checks.

## Milestone Plan

### Milestone A - Foundation Vertical Slice (current)
- Domain model + basic simulation
- Store + persistence
- Base UI with phase-space

### Milestone B - Player Planning Depth
- Objective-level action targeting
- Better conflict explanations
- Relationship visualization

### Milestone C - AI and Balance
- Utility AI refinement
- Anti-snowball balancing pass
- Telemetry dashboard script

### Milestone D - MVP Validation
- Playtest protocol
- KPI target checks
- Scope freeze for MVP

## Acceptance Gates

### Gate 1: Technical
- `npm run typecheck` passes.
- `npm run build` passes.
- Deterministic replay: same seed yields same outcomes.

### Gate 2: Design and Agency
- Player has at least 3 meaningful choices each session.
- Doctrine recommendation is visible and comparable against player override.
- Doctrine divergence appears in at least 30% of playtest sessions without automatic failure bias.
- Intel-driven replans are available and visibly justified by confidence/reliability data.
- Compatible/contested/mutually-exclusive conflicts are visible in UI.

### Gate 3: Playtest
- Players understand phase-space interpretation after onboarding.
- No dominant strategy exceeds acceptable usage threshold.

## Immediate Backlog (next 10 working days)
1. Add formal objective targeting in player actions.
2. Implement seasonal doctrine generation and recommendation output.
3. Add intel-driven doctrine replan triggers and explanation hooks.
4. Expose conflict resolution math in a detail panel.
5. Add relationship edge visualization component.
6. Add deterministic replay debug panel.
7. Add telemetry event adapter and local JSON exporter.
8. Add domain tests for objective resolver.
9. Add domain tests for relationship transitions.
10. Run first balance batch across 200 seeds.
