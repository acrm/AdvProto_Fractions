# Phase Dominion - Game Design Document

## Scope
This document defines the production-ready design baseline for the seasonal multi-faction strategy game implemented in this repository.

## Vision and Pillars
- Build a high-replayability strategy game driven by uncertainty, manipulation, and timing.
- Keep the player faction non-dominant but highly maneuverable.
- Ensure every session creates meaningful tradeoffs between objective progress and sabotage.
- Present a seasonal doctrine recommendation while preserving full player authority to override it.
- Treat roleplay style as a first-class strategic input, not a failure to optimize.
- Keep complexity readable via a five-axis phase-space visualization.

## Core Loop
1. Read season status and faction trajectories.
2. Review the seasonal doctrine recommendation generated from objectives, relationships, and trajectories.
3. Optionally override doctrine with a custom five-vector intent based on intel, risk appetite, or playstyle.
4. Resolve one session of simultaneous faction actions.
5. Apply objective outcomes, relationship shifts, resource changes, and intel updates.
6. Re-evaluate next move with updated partial information.

Notes:
- Doctrine is advisory, not mandatory.
- Mid-season pivots are valid play and must remain competitive with strict doctrine-following.
- The game should reward informed adaptation, not rigid obedience.

## Seasonal Loop
1. Generate 3 to 5 objectives per faction.
2. Build objective conflict graph.
3. Derive seasonal doctrine recommendation for the player faction.
4. Run 4 sessions per season.
5. Apply end-season scoring and carryover.
6. Continue until campaign season limit is reached.

## Seasonal Doctrine
At the start of each season, the simulation derives a recommended doctrine for the player faction.

Recommendation inputs:
- Objective portfolio risk and reward profile.
- Visible and inferred relationship pressure.
- Five-vector trajectory momentum and volatility.

Player options each session:
- Follow doctrine for stable efficiency and predictable exposure trends.
- Override doctrine for tactical freedom and style expression.
- Pivot doctrine when new intel materially changes threat or opportunity.

Override philosophy:
- Deviation creates friction and opportunity cost.
- Deviation must never be treated as invalid play.
- High-confidence contradictory intel should justify lower pivot friction.

## Faction Model
Each faction contains:
- Core stats: powerBase, agility, influence, resourceStock, exposure, score.
- Five activity vectors in range -100 to 100.
- Objective portfolio and trajectory history.

## Relationship Model
Dual-layer relationship state:
- Visible: alliance, cooperative-neutral, competitive-neutral, rivalry, open-hostility.
- Hidden: none, hidden-sympathy, hidden-resentment, secret-pact, covert-conflict.

Relationship edges update each session through stability transitions.

## Objective Model
Objective fields:
- Type: influence, control, resource, elimination, positioning.
- Priority: critical, high, medium, low.
- Cost, reward, visibility, status.

Generation constraints:
- Every faction gets 3 to 5 objectives each season.
- At least one player-involved conflict edge is generated.

## Conflict Model
Formal classes:
- compatible: both objectives can succeed.
- contested: one objective success can partially invalidate rival outcome.
- mutually-exclusive: both cannot stand as success; one winner remains.

## Information and Intel Model
Known at season start:
- Visible relationships, visible objectives, previous season state.

Hidden at season start:
- Hidden objective visibility states, deception quality, hidden relationship tags.

Intel acquisition:
- Session resolution emits intel items with confidence and reliability.
- Deception is modeled using low reliability plus deceptive flag.
- High-confidence contradictory intel should trigger doctrine re-evaluation prompts.

## Five Activity Vectors
1. territorialPressure
- Range: -100 to 100
- Growth: territorial gains, forward operations
- Decline: zone losses, overextension penalties
- Extremes: low -> weak map leverage, high -> upkeep pressure

2. diplomaticMomentum
- Range: -100 to 100
- Growth: agreements and mediation
- Decline: betrayal, exposed covert actions
- Extremes: low -> isolation, high -> coalition backlash risk

3. economicThroughput
- Range: -100 to 100
- Growth: resource access, efficient logistics
- Decline: sanctions, sabotage, disrupted supply
- Extremes: low -> action budget constraints, high -> inefficiency events

4. covertTempo
- Range: -100 to 100
- Growth: espionage network and sabotage investment
- Decline: exposure spikes and counter-intel losses
- Extremes: low -> weak disruption capacity, high -> retaliation certainty

5. deterrencePosture
- Range: -100 to 100
- Growth: deterrence operations and force signaling
- Decline: attrition, strategic demobilization
- Extremes: low -> coercion vulnerability, high -> escalation pressure

## Win and Fail Conditions
Win:
- Reach campaign score threshold while maintaining operational viability through a consistent strategic identity.

Fail:
- Campaign ends with strategic collapse (resource starvation, high exposure lock, or objective failure cascade).

## Friction and Cost Model
- Repeated sabotage raises exposure tax and retaliation risk.
- Passive accumulation incurs opportunity cost and strategic drift.
- Leader factions absorb coalition pressure to curb runaway snowballing.

Design intent:
- Friction should shape strategic identity, not force a single correct plan.
- Costs communicate consequences while preserving agency.

## MVP Baseline
- 4 factions.
- 6 seasons.
- 4 sessions per season.
- Seeded deterministic simulation.
- Base phase-space view and session controls.

## Telemetry Baseline
Track:
- Strategic depth: meaningful option count, comeback viability.
- Decision diversity: action mix entropy.
- Diagram readability: interpretation speed and confidence proxies.
- Doctrine adherence ratio by season and by player profile.
- Doctrine divergence frequency and average divergence magnitude.
- Intel-driven pivot frequency and pivot outcome quality.
- Playstyle viability parity across doctrine-heavy and doctrine-light runs.

## Current Implementation Note
The repository now contains the initial vertical slice:
- Domain model and rules engine.
- Session simulation loop.
- Zustand application store.
- Basic phase-space shell UI.
