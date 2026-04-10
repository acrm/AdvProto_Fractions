# Vector Semantics

The simulation keeps its internal five-vector model, but the UI and narrative should interpret them diegetically:

## territorialPressure
- Diegetic reading: claim lines, forts, checkpoints, legal right of entry, frontier footprint.
- Gameplay meaning: how hard a faction pushes to take and keep physical control of routes, shafts, camps, and zones.
- High value implies: aggressive expansion, border pressure, rapid claim disputes.
- Low/negative value implies: retreat from direct control, softer territorial posture.

## diplomaticMomentum
- Diegetic reading: council leverage, patronage, shrine favor, negotiated access, political cover.
- Gameplay meaning: political traction with councils, clergy, and brokers.
- High value implies: easier deals, more legitimacy, wider cooperation windows.
- Low/negative value implies: stalled talks, distrust, less institutional support.

## economicThroughput
- Diegetic reading: caravans, extraction rights, haulage, debt chains, supply control.
- Gameplay meaning: efficiency and control of resource flow and logistics.
- High value implies: stronger supply lines, better monetization, faster material conversion.
- Low/negative value implies: bottlenecks, shortages, weaker trade leverage.

## covertTempo
- Diegetic reading: scouts, smugglers, saboteurs, informants, assassins, illicit routes.
- Gameplay meaning: tempo of hidden operations and deniable actions.
- High value implies: faster infiltration/sabotage opportunities with higher exposure risk.
- Low/negative value implies: reduced clandestine activity and fewer covert options.

## deterrencePosture
- Diegetic reading: mercenary readiness, banner strength, reprisals, intimidation, hard security.
- Gameplay meaning: visible threat level and readiness to punish escalation.
- High value implies: stronger intimidation and security response, but can harden opposition.
- Low/negative value implies: lighter hard-power posture, less coercive pressure.

## Unit Intent Constraint
- The player intent vector is always normalized to unit length ($||v||_2 = 1$).
- Zero vector is disallowed: when all components collapse, the system re-seeds a random unit vector.
- Editing one component redistributes total vector length across the other components; you are reallocating one fixed tactical budget in direction space.

Preferred approach:
- Keep these as mechanical keys in code.
- Translate them into world language in the UI and narrative layer.
