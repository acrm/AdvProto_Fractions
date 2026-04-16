# Scenario Mechanics Design Doc

## Scope
This document formalizes gameplay mechanics derived from the approved Northgate scenario and the hypothetical Season 1-2 flow.
It is implementation-oriented and intended as input for engineering planning.

References:
- `docs/NORTHGATE_SETTING.md`
- `docs/GAME_LOGIC.md`

## Design Goal
Convert narrative seasonal progression into deterministic, system-driven mechanics with explicit player agency over remaining seasonal movement.

## Canon Constraints
- Campaign context is Northgate and the newly opened underground continent.
- Each season has exactly 5 iterations.
- At season start, every faction commits a full seasonal movement vector.
- Each iteration executes exactly 20% of the original committed vector.
- Non-player factions do not replan during a season in baseline MVP.
- Only the player can replan the remaining portion after each iteration.
- Executed vector portions are locked and cannot be altered retroactively.

## Core Mechanics

### 1) Seasonal Commitment
At `seasonStart` each faction defines:
- `seasonStartResources` (snapshot of resources at iteration 1 start),
- `longTermGoalId` (hidden for non-player factions),
- `committedVector` (five-axis plan for this season),
- `executedFraction = 0.0`.

Rules:
- `committedVector` is immutable for NPC factions during the season.
- Player stores `currentRemainingVector`, initially equal to `committedVector`.

### 2) Iteration Execution
For iteration index `i` in `[1..5]`:
- `stepFraction = 0.2`.
- Each faction executes `stepVector = committedVector * 0.2` for baseline behavior.
- For player faction, execute `stepVector = currentRemainingVector * 0.2 / remainingFraction`.

Where:
- `remainingFraction = 1.0 - executedFraction` before step execution.
- After step: `executedFraction += 0.2`.

Interpretation:
- The player is not changing past trajectory.
- The player adjusts only the still-unexecuted part.

### 3) Remaining-Vector Authority (Player)
After each completed iteration, player may replace only the remaining direction.

Allowed authority windows:
- Before iteration 2: controls remaining `0.8`.
- Before iteration 3: controls remaining `0.6`.
- Before iteration 4: controls remaining `0.4`.
- Before iteration 5: controls remaining `0.2`.

Not allowed:
- Rewriting already executed 20% chunks.
- Cancelling already emitted world events.

### 4) Event and News Emission
Every iteration generates a deterministic `WorldSignalSet`:
- `events`: systemic state changes (route collapse, charter dispute, relic verification lock, etc.).
- `news`: diegetic reports visible to factions (dock bulletins, patrol dispatches, market rumors, clerical notices, deep contact reports).

Signal generation inputs:
- current location pressure map,
- faction step vectors,
- resource deltas,
- exposure and public order,
- seeded random stream.

### 5) Baseline NPC Behavior
MVP baseline:
- NPC factions continue executing season-start committed vectors.
- NPCs consume and gain resources from iteration outcomes.
- NPC intent remains fixed until next `seasonStart`.

### 6) Player Pivot Cost Model
Pivoting remaining vector is legal by default.
Cost model applies to future outcomes, not to action validity.

Recommended baseline penalties (tunable):
- `pivotFrictionResourceCost`: additional resource drain proportional to pivot magnitude.
- `pivotExposureCost`: exposure increase for sharp doctrine break.
- `pivotReliabilityBonus`: penalty reduction when contradiction intel confidence is high.

## Data Model Additions

### SeasonPlan
```ts
interface SeasonPlan {
  factionId: string
  longTermGoalId: string
  committedVector: ActivityVectorState
  executedFraction: number // 0.0..1.0, increments by 0.2
  currentRemainingVector: ActivityVectorState // player only mutable
  replansUsed: number
}
```

### IterationReport
```ts
interface IterationReport {
  seasonNumber: number
  iterationIndex: 1 | 2 | 3 | 4 | 5
  executedSteps: Array<{
    factionId: string
    stepVector: ActivityVectorState
    resourceDelta: number
    exposureDelta: number
  }>
  events: WorldEvent[]
  news: NewsItem[]
}
```

### FactionLongTermGoal
```ts
type LongTermGoalType =
  | 'gate-access-monopoly'
  | 'ancestral-hold-restoration'
  | 'charter-finance-control'
  | 'security-standard-mandate'
  | 'knowledge-legitimacy-control'
  | 'black-channel-dependence'
  | 'deep-territory-protection'
```

## Iteration Pipeline (Engine)
1. Load `SeasonPlan` for all factions.
2. Compute faction step vectors for current iteration.
3. Apply movement and systemic effects.
4. Resolve resource, exposure, objective, and relationship updates.
5. Generate deterministic `events` and `news`.
6. Persist `IterationReport` and updated `GameState`.
7. If player faction and `iterationIndex < 5`, open remaining-vector replanning window.

## UI/UX Contract

### Must-have screens/components
- Season plan panel: committed vector, executed fraction, remaining fraction.
- Iteration timeline: 5 slots with lock markers for completed chunks.
- Replan panel (player only): edit remaining vector only.
- News feed panel: diegetic report stream grouped by iteration.

### Must-have affordances
- Visual lock on completed trajectory segment.
- Explicit readout: `Remaining authority: 0.8 / 0.6 / 0.4 / 0.2`.
- Pivot cost preview before confirm.

## Balance Knobs
- `baseStepVolatility`
- `eventDensityPerIteration`
- `pivotFrictionResourceCostScale`
- `pivotExposureCostScale`
- `intelConfidencePivotDiscountThreshold`
- `publicOrderShockSensitivity`

## Telemetry Requirements
Track per campaign:
- average pivot count per season,
- average pivot magnitude by iteration index,
- player win rate by pivot profile,
- resource efficiency difference between no-pivot and adaptive play,
- exposure growth correlation with late pivots,
- frequency of high-confidence contradiction intel before pivots.

## Acceptance Criteria (MVP)
1. Seasonal plan is created once per faction at season start.
2. Engine runs exactly 5 iterations with fixed 20% progression each.
3. Completed trajectory portions are immutable.
4. Player can replan remaining vector at iteration boundaries only.
5. NPCs do not replan mid-season.
6. Each iteration emits events and diegetic news entries.
7. Replan preview exposes expected resource and exposure impact.

## Out of Scope (Current Phase)
- Mid-season NPC adaptive replanning.
- Multi-turn negotiation interface with Deepkind.
- Dynamic legal simulation for charter law voting.
- Narrative branching with bespoke authored cutscenes.

## Implementation Backlog Seed
1. Add `SeasonPlan` and `IterationReport` domain entities.
2. Refactor session loop into 5-iteration seasonal engine.
3. Implement remaining-vector replan command for player.
4. Add pivot friction and intel discount formulas.
5. Add iteration news/event generator bound to Northgate tone.
6. Add timeline UI with locked segment rendering.
7. Add telemetry events for pivots and adaptation outcomes.
