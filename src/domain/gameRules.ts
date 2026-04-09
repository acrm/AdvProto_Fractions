import {
  ActivityVectorState,
  CompatibilityClass,
  Faction,
  GameConfig,
  GameState,
  HiddenRelationState,
  IntelItem,
  Objective,
  ObjectiveConflict,
  ObjectivePriority,
  ObjectiveType,
  PlayerIntent,
  ObjectiveVisibility,
  PlayerStrategy,
  RelationshipEdge,
  RelationshipState,
  SeasonState,
  SessionOutcome,
  TurnForecast,
} from './gameModel'
import { createSeededRandom } from '../infrastructure/seededRandom'

const FACTION_NAMES = [
  'Helios Combine',
  'Noctis Assembly',
  'Verdant Compact',
  'Iron Covenant',
  'Azure League',
  'Obsidian Circle',
  'Saffron Bureau',
]

const OBJECTIVE_TYPES: ObjectiveType[] = ['influence', 'control', 'resource', 'elimination', 'positioning']
const OBJECTIVE_PRIORITIES: ObjectivePriority[] = ['critical', 'high', 'medium', 'low']
const OBJECTIVE_VISIBILITY: ObjectiveVisibility[] = ['public', 'suspected', 'hidden']
const REL_VISIBLE: RelationshipState[] = [
  'alliance',
  'cooperative-neutral',
  'competitive-neutral',
  'rivalry',
  'open-hostility',
]
const REL_HIDDEN: HiddenRelationState[] = ['none', 'hidden-sympathy', 'hidden-resentment', 'secret-pact', 'covert-conflict']
const COMPATIBILITY_CLASSES: CompatibilityClass[] = ['compatible', 'contested', 'mutually-exclusive']
const INITIAL_VECTOR_OFFSETS: ActivityVectorState[] = [
  {
    territorialPressure: 18,
    diplomaticMomentum: 12,
    economicThroughput: 16,
    covertTempo: -8,
    deterrencePosture: -10,
  },
  {
    territorialPressure: -14,
    diplomaticMomentum: 20,
    economicThroughput: 10,
    covertTempo: 14,
    deterrencePosture: -6,
  },
  {
    territorialPressure: 10,
    diplomaticMomentum: -16,
    economicThroughput: -12,
    covertTempo: 18,
    deterrencePosture: 14,
  },
  {
    territorialPressure: -20,
    diplomaticMomentum: -10,
    economicThroughput: 14,
    covertTempo: -16,
    deterrencePosture: 18,
  },
  {
    territorialPressure: 16,
    diplomaticMomentum: -18,
    economicThroughput: 18,
    covertTempo: 8,
    deterrencePosture: -14,
  },
  {
    territorialPressure: -18,
    diplomaticMomentum: 8,
    economicThroughput: -16,
    covertTempo: -12,
    deterrencePosture: 16,
  },
]

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function objectiveCountForFaction(randValue: number): number {
  if (randValue < 0.34) return 3
  if (randValue < 0.67) return 4
  return 5
}

function priorityToNumbers(priority: ObjectivePriority): { cost: number; reward: number } {
  if (priority === 'critical') return { cost: 16, reward: 30 }
  if (priority === 'high') return { cost: 12, reward: 22 }
  if (priority === 'medium') return { cost: 8, reward: 14 }
  return { cost: 5, reward: 8 }
}

export function createZeroVectorState(): ActivityVectorState {
  return {
    territorialPressure: 0,
    diplomaticMomentum: 0,
    economicThroughput: 0,
    covertTempo: 0,
    deterrencePosture: 0,
  }
}

export function createEmptyPlayerIntent(): PlayerIntent {
  return {
    adjustments: createZeroVectorState(),
  }
}

function sumPositiveIntent(intent: PlayerIntent): number {
  return Object.values(intent.adjustments).reduce((total, value) => total + Math.max(0, value), 0)
}

function sumNegativeIntent(intent: PlayerIntent): number {
  return Object.values(intent.adjustments).reduce((total, value) => total + Math.abs(Math.min(0, value)), 0)
}

export function deriveStrategyFromIntent(intent: PlayerIntent): PlayerStrategy {
  const progressBias =
    intent.adjustments.territorialPressure +
    intent.adjustments.diplomaticMomentum +
    intent.adjustments.economicThroughput

  const sabotageBias =
    intent.adjustments.covertTempo +
    intent.adjustments.deterrencePosture -
    Math.min(0, intent.adjustments.diplomaticMomentum)

  if (sabotageBias - progressBias >= 8) return 'sabotage'
  if (progressBias - sabotageBias >= 8) return 'progress'
  return 'balanced'
}

function intentResourceDelta(intent: PlayerIntent): number {
  const gross = sumPositiveIntent(intent) + sumNegativeIntent(intent)
  return -Math.max(4, Math.round(gross / 3))
}

function intentExposureDelta(intent: PlayerIntent, strategy: PlayerStrategy): number {
  const covertWeight = Math.max(0, intent.adjustments.covertTempo)
  const deterrenceWeight = Math.max(0, intent.adjustments.deterrencePosture)
  const diplomaticRelief = Math.max(0, intent.adjustments.diplomaticMomentum)
  const base = strategy === 'sabotage' ? 5 : strategy === 'progress' ? 2 : 3
  return Math.max(1, Math.round(base + covertWeight / 4 + deterrenceWeight / 8 - diplomaticRelief / 10))
}

function intentScorePressure(intent: PlayerIntent): number {
  return Math.round(
    intent.adjustments.territorialPressure * 0.4 +
    intent.adjustments.economicThroughput * 0.4 +
    intent.adjustments.diplomaticMomentum * 0.2 +
    intent.adjustments.covertTempo * 0.15,
  )
}

function initialFactionVectors(index: number, isPlayer: boolean): ActivityVectorState {
  if (isPlayer) return createZeroVectorState()

  const offset = INITIAL_VECTOR_OFFSETS[index % INITIAL_VECTOR_OFFSETS.length]
  return {
    territorialPressure: offset.territorialPressure,
    diplomaticMomentum: offset.diplomaticMomentum,
    economicThroughput: offset.economicThroughput,
    covertTempo: offset.covertTempo,
    deterrencePosture: offset.deterrencePosture,
  }
}

function createFaction(index: number, factionCount: number): Faction {
  const name = FACTION_NAMES[index] ?? `Faction ${index + 1}`
  const isPlayer = index === factionCount - 1
  const initialVectors = initialFactionVectors(index, isPlayer)

  return {
    id: `f${index + 1}`,
    name: isPlayer ? `${name} (Player)` : name,
    isPlayer,
    powerBase: isPlayer ? 52 : 62,
    agility: isPlayer ? 74 : 56,
    influence: isPlayer ? 58 : 60,
    resourceStock: isPlayer ? 72 : 84,
    exposure: isPlayer ? 12 : 6,
    score: 0,
    vectors: initialVectors,
    trajectory: [initialVectors],
  }
}

function createRelationships(factions: Faction[], seed: number): RelationshipEdge[] {
  const rng = createSeededRandom(seed + 11)
  const edges: RelationshipEdge[] = []

  for (let i = 0; i < factions.length; i += 1) {
    for (let j = i + 1; j < factions.length; j += 1) {
      edges.push({
        factionA: factions[i].id,
        factionB: factions[j].id,
        visible: REL_VISIBLE[rng.nextInt(1, 3)],
        hidden: REL_HIDDEN[rng.nextInt(0, REL_HIDDEN.length - 1)],
        stability: clamp(rng.next(), 0, 1),
      })
    }
  }

  return edges
}

function generateObjectives(factions: Faction[], seed: number, seasonNumber: number): Objective[] {
  const rng = createSeededRandom(seed + seasonNumber * 101)
  const objectives: Objective[] = []

  factions.forEach((faction) => {
    const count = objectiveCountForFaction(rng.next())
    for (let index = 0; index < count; index += 1) {
      const priority = OBJECTIVE_PRIORITIES[rng.nextInt(0, OBJECTIVE_PRIORITIES.length - 1)]
      const numeric = priorityToNumbers(priority)
      objectives.push({
        id: `${faction.id}-s${seasonNumber}-o${index + 1}`,
        factionId: faction.id,
        type: OBJECTIVE_TYPES[rng.nextInt(0, OBJECTIVE_TYPES.length - 1)],
        priority,
        cost: numeric.cost,
        reward: numeric.reward,
        visibility: faction.isPlayer ? 'public' : OBJECTIVE_VISIBILITY[rng.nextInt(0, OBJECTIVE_VISIBILITY.length - 1)],
        status: 'pending',
      })
    }
  })

  return objectives
}

function generateConflicts(objectives: Objective[], factions: Faction[], seed: number, seasonNumber: number): ObjectiveConflict[] {
  const playerFaction = factions.find((faction) => faction.isPlayer)
  if (!playerFaction) return []

  const rng = createSeededRandom(seed + seasonNumber * 149)
  const playerObjectives = objectives.filter((objective) => objective.factionId === playerFaction.id)
  const foreignObjectives = objectives.filter((objective) => objective.factionId !== playerFaction.id)
  const conflicts: ObjectiveConflict[] = []

  for (const playerObjective of playerObjectives) {
    const rival = foreignObjectives[rng.nextInt(0, foreignObjectives.length - 1)]
    conflicts.push({
      objectiveAId: playerObjective.id,
      objectiveBId: rival.id,
      class: COMPATIBILITY_CLASSES[rng.nextInt(0, COMPATIBILITY_CLASSES.length - 1)],
    })
  }

  return conflicts
}

function createSeason(seed: number, seasonNumber: number, factions: Faction[], maxSessions: number): SeasonState {
  const objectives = generateObjectives(factions, seed, seasonNumber)
  const conflicts = generateConflicts(objectives, factions, seed, seasonNumber)

  return {
    seasonNumber,
    sessionIndex: 1,
    maxSessions,
    objectives,
    conflicts,
    intel: [],
    logs: [`Season ${seasonNumber} initialized with ${objectives.length} objectives.`],
  }
}

function nextVectorState(
  current: ActivityVectorState,
  strategy: PlayerStrategy,
  rngSeed: number,
  intent?: PlayerIntent,
): ActivityVectorState {
  const rng = createSeededRandom(rngSeed)
  const nextVectors = { ...current }
  const adjustments = intent?.adjustments ?? createZeroVectorState()

  const strategyBonus = strategy === 'progress' ? 8 : strategy === 'sabotage' ? -6 : 2
  nextVectors.territorialPressure = clamp(nextVectors.territorialPressure + rng.nextInt(-6, 9) + strategyBonus + adjustments.territorialPressure, -100, 100)
  nextVectors.diplomaticMomentum = clamp(nextVectors.diplomaticMomentum + rng.nextInt(-7, 8) + adjustments.diplomaticMomentum, -100, 100)
  nextVectors.economicThroughput = clamp(nextVectors.economicThroughput + rng.nextInt(-6, 10) + adjustments.economicThroughput, -100, 100)
  nextVectors.covertTempo = clamp(nextVectors.covertTempo + rng.nextInt(-8, 12) + (strategy === 'sabotage' ? 10 : 0) + adjustments.covertTempo, -100, 100)
  nextVectors.deterrencePosture = clamp(nextVectors.deterrencePosture + rng.nextInt(-5, 9) + adjustments.deterrencePosture, -100, 100)

  return nextVectors
}

function updateFactionVectors(faction: Faction, strategy: PlayerStrategy, rngSeed: number, intent?: PlayerIntent): Faction {
  const nextVectors = nextVectorState(faction.vectors, strategy, rngSeed, intent)

  return {
    ...faction,
    vectors: nextVectors,
    trajectory: [...faction.trajectory.slice(-5), nextVectors],
  }
}

export function forecastPlayerTurn(state: GameState, intent: PlayerIntent): TurnForecast {
  const playerFaction = state.factions.find((faction) => faction.isPlayer)
  if (!playerFaction) {
    return {
      derivedStrategy: 'balanced',
      projectedVectors: createZeroVectorState(),
      resourceDelta: 0,
      exposureDelta: 0,
      scorePressure: 0,
    }
  }

  const derivedStrategy = deriveStrategyFromIntent(intent)

  return {
    derivedStrategy,
    projectedVectors: nextVectorState(playerFaction.vectors, derivedStrategy, state.seed + state.seasonState.sessionIndex * 17, intent),
    resourceDelta: intentResourceDelta(intent),
    exposureDelta: intentExposureDelta(intent, derivedStrategy),
    scorePressure: intentScorePressure(intent),
  }
}

function resolveObjectives(
  objectives: Objective[],
  factions: Faction[],
  conflicts: ObjectiveConflict[],
  strategy: PlayerStrategy,
  seed: number,
): {
  nextObjectives: Objective[]
  nextFactions: Faction[]
  progressedObjectives: number
  sabotagedObjectives: number
} {
  const rng = createSeededRandom(seed)
  const nextObjectives = objectives.map((objective) => ({ ...objective }))
  const factionMap = new Map(factions.map((faction) => [faction.id, { ...faction }]))
  let progressedObjectives = 0
  let sabotagedObjectives = 0

  nextObjectives.forEach((objective) => {
    if (objective.status !== 'pending') return
    const faction = factionMap.get(objective.factionId)
    if (!faction) return

    const base = faction.powerBase + faction.agility + faction.influence
    const economy = faction.vectors.economicThroughput * 0.2
    const covert = faction.vectors.covertTempo * 0.15
    const strategyModifier = faction.isPlayer
      ? strategy === 'progress'
        ? 14
        : strategy === 'sabotage'
          ? -8
          : 4
      : 0

    const score = base + economy + covert + strategyModifier + rng.nextInt(-25, 25)
    const passThreshold = objective.cost * 10

    objective.status = score >= passThreshold ? 'succeeded' : 'failed'

    if (objective.status === 'succeeded') {
      faction.score += objective.reward
      faction.resourceStock = clamp(faction.resourceStock - objective.cost + rng.nextInt(3, 8), 0, 200)
      if (faction.isPlayer) progressedObjectives += 1
    } else {
      faction.resourceStock = clamp(faction.resourceStock - Math.ceil(objective.cost / 2), 0, 200)
    }
  })

  conflicts.forEach((conflict) => {
    const objectiveA = nextObjectives.find((objective) => objective.id === conflict.objectiveAId)
    const objectiveB = nextObjectives.find((objective) => objective.id === conflict.objectiveBId)
    if (!objectiveA || !objectiveB) return

    if (conflict.class === 'compatible') return

    if (conflict.class === 'contested') {
      if (objectiveA.status === 'succeeded' && objectiveB.status === 'succeeded') {
        objectiveB.status = 'failed'
        const owner = factionMap.get(objectiveB.factionId)
        if (owner) owner.score = Math.max(0, owner.score - Math.floor(objectiveB.reward * 0.75))
        sabotagedObjectives += 1
      }
      return
    }

    if (objectiveA.status === objectiveB.status) {
      if (objectiveA.status === 'succeeded') {
        const loser = rng.nextInt(0, 1) === 0 ? objectiveA : objectiveB
        loser.status = 'failed'
        const owner = factionMap.get(loser.factionId)
        if (owner) owner.score = Math.max(0, owner.score - loser.reward)
        sabotagedObjectives += 1
      }
      return
    }

    const succeeded = objectiveA.status === 'succeeded' ? objectiveA : objectiveB
    const failed = succeeded.id === objectiveA.id ? objectiveB : objectiveA
    if (succeeded.factionId !== failed.factionId && succeeded.factionId !== '') sabotagedObjectives += 1
  })

  return {
    nextObjectives,
    nextFactions: Array.from(factionMap.values()),
    progressedObjectives,
    sabotagedObjectives,
  }
}

function buildIntelItem(season: SeasonState, factions: Faction[], seed: number): IntelItem {
  const rng = createSeededRandom(seed + season.sessionIndex * 23)
  const nonPlayerFactions = factions.filter((faction) => !faction.isPlayer)
  const target = nonPlayerFactions[rng.nextInt(0, nonPlayerFactions.length - 1)]
  const confidence = clamp(rng.next(), 0.3, 0.95)
  const reliability = clamp(rng.next(), 0.35, 0.98)
  const deceptive = reliability < 0.55 && rng.next() > 0.65

  return {
    id: `intel-s${season.seasonNumber}-${season.sessionIndex}-${target.id}`,
    aboutFactionId: target.id,
    confidence,
    reliability,
    isDeceptive: deceptive,
    sessionDiscovered: season.sessionIndex,
    message: deceptive
      ? `${target.name} appears cooperative, but the source might be compromised.`
      : `${target.name} is preparing pressure operations for next session.`,
  }
}

function updateRelationships(relationships: RelationshipEdge[], seed: number): RelationshipEdge[] {
  const rng = createSeededRandom(seed)
  return relationships.map((edge) => {
    const stabilityDelta = rng.nextInt(-10, 8) / 100
    const nextStability = clamp(edge.stability + stabilityDelta, 0, 1)

    let visible = edge.visible
    if (nextStability < 0.22 && edge.visible !== 'open-hostility') {
      visible = 'rivalry'
    } else if (nextStability > 0.78 && edge.visible !== 'alliance') {
      visible = 'cooperative-neutral'
    }

    return {
      ...edge,
      visible,
      stability: nextStability,
    }
  })
}

export function createDefaultGameConfig(): GameConfig {
  return {
    factionCount: 4,
    campaignSeasons: 6,
    sessionsPerSeason: 4,
  }
}

export function createInitialGameState(seed: number, config: GameConfig = createDefaultGameConfig()): GameState {
  const factionCount = clamp(config.factionCount, 3, 7)
  const factions = Array.from({ length: factionCount }, (_, index) => createFaction(index, factionCount))

  return {
    seed,
    config,
    currentSeason: 1,
    factions,
    relationships: createRelationships(factions, seed),
    seasonState: createSeason(seed, 1, factions, config.sessionsPerSeason),
    completed: false,
  }
}

export function runSession(state: GameState, strategy: PlayerStrategy, playerIntent: PlayerIntent = createEmptyPlayerIntent()): { nextState: GameState; outcome: SessionOutcome } {
  if (state.completed) {
    return {
      nextState: state,
      outcome: {
        summary: 'Campaign is already completed.',
        progressedObjectives: 0,
        sabotagedObjectives: 0,
        playerExposureDelta: 0,
      },
    }
  }

  const season = state.seasonState
  const seasonSeed = state.seed + season.seasonNumber * 1000 + season.sessionIndex * 57

  const vectorUpdated = state.factions.map((faction, index) =>
    updateFactionVectors(
      faction,
      faction.isPlayer ? strategy : 'balanced',
      seasonSeed + index * 13,
      faction.isPlayer ? playerIntent : undefined,
    ),
  )

  const resolution = resolveObjectives(
    season.objectives,
    vectorUpdated,
    season.conflicts,
    strategy,
    seasonSeed + 9,
  )

  const nextIntel = [...season.intel, buildIntelItem(season, resolution.nextFactions, seasonSeed + 31)]

  const playerFaction = resolution.nextFactions.find((faction) => faction.isPlayer)
  const nextExposureDelta = intentExposureDelta(playerIntent, strategy)
  if (playerFaction) {
    playerFaction.resourceStock = clamp(playerFaction.resourceStock + intentResourceDelta(playerIntent), 0, 200)
    playerFaction.exposure = clamp(playerFaction.exposure + nextExposureDelta, 0, 100)
  }

  const nextSessionIndex = season.sessionIndex + 1
  const seasonComplete = nextSessionIndex > season.maxSessions
  const nextRelationships = updateRelationships(state.relationships, seasonSeed + 71)

  const logLine = `Season ${season.seasonNumber}, Session ${season.sessionIndex}: progress=${resolution.progressedObjectives}, sabotage=${resolution.sabotagedObjectives}, strategy=${strategy}`

  let nextState: GameState

  if (!seasonComplete) {
    nextState = {
      ...state,
      factions: resolution.nextFactions,
      relationships: nextRelationships,
      seasonState: {
        ...season,
        sessionIndex: nextSessionIndex,
        objectives: resolution.nextObjectives,
        intel: nextIntel,
        logs: [...season.logs, logLine],
      },
    }
  } else {
    const nextSeasonNumber = season.seasonNumber + 1
    const campaignDone = nextSeasonNumber > state.config.campaignSeasons
    const transitionLogs = [...season.logs, logLine, `Season ${season.seasonNumber} closed.`]

    nextState = {
      ...state,
      currentSeason: season.seasonNumber,
      factions: resolution.nextFactions,
      relationships: nextRelationships,
      seasonState: campaignDone
        ? { ...season, logs: transitionLogs }
        : createSeason(state.seed, nextSeasonNumber, resolution.nextFactions, state.config.sessionsPerSeason),
      completed: campaignDone,
    }
  }

  return {
    nextState,
    outcome: {
      summary: logLine,
      progressedObjectives: resolution.progressedObjectives,
      sabotagedObjectives: resolution.sabotagedObjectives,
      playerExposureDelta: nextExposureDelta,
    },
  }
}
