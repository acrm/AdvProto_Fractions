export const ACTIVITY_VECTORS = [
  'territorialPressure',
  'diplomaticMomentum',
  'economicThroughput',
  'covertTempo',
  'deterrencePosture',
] as const

export type ActivityVectorName = (typeof ACTIVITY_VECTORS)[number]

export type ActivityVectorState = Record<ActivityVectorName, number>

export type RelationshipState =
  | 'alliance'
  | 'cooperative-neutral'
  | 'competitive-neutral'
  | 'rivalry'
  | 'open-hostility'

export type HiddenRelationState =
  | 'none'
  | 'hidden-sympathy'
  | 'hidden-resentment'
  | 'secret-pact'
  | 'covert-conflict'

export type ObjectiveType = 'influence' | 'control' | 'resource' | 'elimination' | 'positioning'

export type ObjectivePriority = 'critical' | 'high' | 'medium' | 'low'

export type ObjectiveVisibility = 'public' | 'suspected' | 'hidden'

export type ObjectiveStatus = 'pending' | 'succeeded' | 'failed'

export type CompatibilityClass = 'compatible' | 'contested' | 'mutually-exclusive'

export interface Faction {
  id: string
  name: string
  isPlayer: boolean
  powerBase: number
  agility: number
  influence: number
  resourceStock: number
  exposure: number
  score: number
  vectors: ActivityVectorState
  trajectory: ActivityVectorState[]
}

export interface RelationshipEdge {
  factionA: string
  factionB: string
  visible: RelationshipState
  hidden: HiddenRelationState
  stability: number
}

export interface Objective {
  id: string
  factionId: string
  type: ObjectiveType
  priority: ObjectivePriority
  cost: number
  reward: number
  visibility: ObjectiveVisibility
  status: ObjectiveStatus
}

export interface ObjectiveConflict {
  objectiveAId: string
  objectiveBId: string
  class: CompatibilityClass
}

export interface IntelItem {
  id: string
  aboutFactionId: string
  confidence: number
  reliability: number
  isDeceptive: boolean
  sessionDiscovered: number
  message: string
}

export interface SeasonState {
  seasonNumber: number
  sessionIndex: number
  maxSessions: number
  objectives: Objective[]
  conflicts: ObjectiveConflict[]
  intel: IntelItem[]
  logs: string[]
}

export interface GameConfig {
  factionCount: number
  campaignSeasons: number
  sessionsPerSeason: number
}

export interface GameState {
  seed: number
  config: GameConfig
  currentSeason: number
  factions: Faction[]
  relationships: RelationshipEdge[]
  seasonState: SeasonState
  completed: boolean
}

export type PlayerStrategy = 'progress' | 'balanced' | 'sabotage'

export interface PlayerIntent {
  adjustments: ActivityVectorState
}

export interface TurnForecast {
  derivedStrategy: PlayerStrategy
  projectedVectors: ActivityVectorState
  resourceDelta: number
  exposureDelta: number
  scorePressure: number
}

export interface SessionOutcome {
  summary: string
  progressedObjectives: number
  sabotagedObjectives: number
  playerExposureDelta: number
}
