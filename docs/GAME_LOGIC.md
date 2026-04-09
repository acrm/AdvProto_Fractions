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
- The player sets a direct movement intent across all 5 activity vectors each session.
- A derived stance (`progress`, `balanced`, `sabotage`) is inferred from that movement intent.
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
- At campaign start, non-player factions receive small distinct vector offsets so initial dots do not overlap at the origin.
- Every non-player faction is rendered as one current dot.
- Every non-player faction also renders a trajectory tail for the last 5 sessions.
- Projection uses a fixed linear mapping from 5D vectors into 2D to keep interpretation stable.
- The chart is the primary tactical screen element and supports zoom, pan, and faction selection.
- Dot radius represents faction resources on a logarithmic scale.
- The player faction uses a persistent distinctive outline even when another faction is selected.

## Command Panel Rules
- The right panel combines campaign summary, selected faction detail, recent intel, and resolution feed.
- The player can set signed intent values for each of the 5 vectors before resolving the next session.
- A deterministic forecast shows projected player vectors, resource delta, exposure delta, and score pressure.

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
