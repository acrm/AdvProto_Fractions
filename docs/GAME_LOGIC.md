# Game Logic

Phase Dominion is a seasonal multi-faction strategy game.

## Campaign Structure
- 3 to 7 factions can be active at runtime.
- The default campaign uses 5 major frontier powers plus the player-run Grey Lantern Guild.
- The player controls the most agile, non-dominant faction.
- A campaign runs through multiple seasons.
- Each season runs 4 sessions in MVP.

## Session Resolution Rules
- Every faction pursues 3 to 5 seasonal objectives.
- Objective classes define interactions: compatible, contested, mutually-exclusive.
- The simulation derives a seasonal doctrine recommendation for the player faction.
- The player sets a direct movement intent across all 5 activity vectors each session.
- A derived stance (`progress`, `balanced`, `sabotage`) is inferred from that movement intent.
- The player may follow or override doctrine at any session without losing turn validity.
- Session results update score, resources, exposure, vectors, and relationships.

## Player Decision Model: Doctrine vs Intent
Each session resolves four decision inputs:
1. Doctrine recommendation: system-generated five-vector direction for the current season.
2. Intel delta: newly discovered information that can reinforce or contradict doctrine.
3. Playstyle profile: player preference (for example opportunist, mediator, saboteur, stabilizer).
4. Final intent: direct player-set vector values used for simulation.

Resolution implications:
- Following doctrine favors stable efficiency and forecast reliability.
- Diverging from doctrine increases friction as opportunity cost, not as binary punishment.
- High-confidence contradictory intel reduces pivot friction and should encourage adaptation.

Forecast requirements:
- Show expected outcome for doctrine-following path.
- Show expected outcome for current override path.
- Show divergence magnitude and projected consequence deltas.

## Information Rules
- Players start with partial information.
- Intel items are discovered through session progress.
- Each intel item stores confidence and reliability.
- Deceptive intel is possible and explicitly modeled.
- Intel should be phrased as short diegetic reports tied to contacts and locations in the North Gate frontier.
- Contradictory high-confidence intel should trigger a doctrine review prompt.

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
- The screen is organized into a top overview row and a bottom tactical row.
- The top row contains campaign status on the left and the faction roster on the right.
- The bottom row contains command planning on the left, the phase chart in the center, and faction focus with intel and resolution feed on the right.
- Desktop dividers between the three panel zones are draggable.
- When a panel is resized, its content should keep its proportions and scale down to remain fully visible within the assigned area instead of relying on internal scrolling.
- It should foreground faction doctrine, home base, leadership, and current agenda alongside raw metrics.
- The player can set signed intent values for each of the 5 vectors before resolving the next session.
- Each vector ray shows deterministic effective intent values directly beside its target token.

## Anti-Exploit Rules
- Repeated sabotage raises exposure and retaliation risk.
- Passive play causes strategic opportunity loss.
- Leader factions face coalition pressure and diminishing advantage.

These rules are friction constraints, not mandatory strategic rails. They shape cost landscapes while preserving player agency and roleplay viability.

## MVP Scope
- 5 major factions plus the player guild.
- 6 campaign seasons.
- 4 sessions per season.
- Deterministic seed-based simulation.
- Base phase-space visualization and session shell.
- Narrative flavor layer for briefings, objectives, intel, and session aftermath.
