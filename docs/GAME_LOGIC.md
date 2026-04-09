# Game Logic

Phase Dominion is a seasonal multi-faction strategy game.

## Campaign Structure
- 3 to 7 factions can be active at runtime.
- The player controls the most agile, non-dominant faction.
- A campaign runs through multiple seasons.
- Each season runs 4 sessions in MVP.

## Session Resolution Rules
- Every faction pursues 3 to 5 seasonal objectives.
- Objective classes define interactions: compatible, contested, mutually-exclusive.
- The player chooses a strategy posture each session: progress, balanced, sabotage.
- Session results update score, resources, exposure, vectors, and relationships.

## Information Rules
- Players start with partial information.
- Intel items are discovered through session progress.
- Each intel item stores confidence and reliability.
- Deceptive intel is possible and explicitly modeled.

## Five Activity Vectors
All factions are represented in a phase-space with vectors in range -100 to 100:
1. territorialPressure
2. diplomaticMomentum
3. economicThroughput
4. covertTempo
5. deterrencePosture

## Phase-Space Visualization Rules
- The chart is player-centered: player position is the origin.
- Every non-player faction is rendered as one current dot.
- Every non-player faction also renders a trajectory tail for the last 5 sessions.
- Projection uses a fixed linear mapping from 5D vectors into 2D to keep interpretation stable.

## Anti-Exploit Rules
- Repeated sabotage raises exposure and retaliation risk.
- Passive play causes strategic opportunity loss.
- Leader factions face coalition pressure and diminishing advantage.

## MVP Scope
- 4 factions.
- 6 campaign seasons.
- 4 sessions per season.
- Deterministic seed-based simulation.
- Base phase-space visualization and session shell.
