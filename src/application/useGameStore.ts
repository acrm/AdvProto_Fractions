import { create } from 'zustand'
import {
  createDefaultGameConfig,
  createEmptyPlayerIntent,
  createInitialGameState,
  deriveStrategyFromIntent,
  forecastPlayerTurn,
  normalizeIntentAdjustments,
  runSession,
} from '../domain/gameRules'
import { ActivityVectorName, GameState, PlayerIntent, SessionOutcome, TurnForecast } from '../domain/gameModel'
import { loadGameState, saveGameState } from '../infrastructure/persistence'

interface GameStoreState {
  gameState: GameState
  selectedFactionId: string
  playerIntent: PlayerIntent
  lastOutcome: SessionOutcome | null
  forecast: TurnForecast
  startCampaign: (seed?: number) => void
  selectFaction: (factionId: string) => void
  setIntentValue: (vector: ActivityVectorName, value: number) => void
  setIntentTarget: (vector: ActivityVectorName, factionId: string) => void
  resetIntent: () => void
  playNextSession: () => void
  resetCampaign: () => void
}

const DEFAULT_SEED = 20260409
const DEFAULT_CONFIG = createDefaultGameConfig()

function createFreshState(seed: number): GameState {
  return createInitialGameState(seed, DEFAULT_CONFIG)
}

function playerFactionId(state: GameState): string {
  return state.factions.find((faction) => faction.isPlayer)?.id ?? state.factions[0]?.id ?? 'unknown'
}

function intentSeed(state: GameState, offset = 0): number {
  return state.seed + state.seasonState.seasonNumber * 100 + state.seasonState.sessionIndex + offset
}

function createIntentForState(state: GameState, offset = 0): PlayerIntent {
  return createEmptyPlayerIntent(
    intentSeed(state, offset),
    state.factions.filter((faction) => !faction.isPlayer).map((faction) => faction.id),
  )
}

const persisted = loadGameState()
const initialState = persisted ?? createFreshState(DEFAULT_SEED)
const initialIntent = createIntentForState(initialState)

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: initialState,
  selectedFactionId: playerFactionId(initialState),
  playerIntent: initialIntent,
  lastOutcome: null,
  forecast: forecastPlayerTurn(initialState, initialIntent),
  startCampaign: (seed) => {
    const nextState = createFreshState(seed ?? DEFAULT_SEED)
    saveGameState(nextState)
    const nextIntent = createIntentForState(nextState)
    set({
      gameState: nextState,
      selectedFactionId: playerFactionId(nextState),
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(nextState, nextIntent),
      lastOutcome: null,
    })
  },
  selectFaction: (factionId) => set({ selectedFactionId: factionId }),
  setIntentValue: (vector, value) => {
    const currentIntent = get().playerIntent
    const state = get().gameState
    const rawAdjustments = {
      ...currentIntent.adjustments,
      [vector]: value,
    }
    const normalizedAdjustments = normalizeIntentAdjustments(
      rawAdjustments,
      intentSeed(state),
    )
    const nextIntent: PlayerIntent = {
      ...currentIntent,
      adjustments: normalizedAdjustments,
    }

    set({
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(state, nextIntent),
    })
  },
  setIntentTarget: (vector, factionId) => {
    const currentIntent = get().playerIntent
    const nextTargets = { ...currentIntent.targets }
    if (factionId) {
      Object.keys(nextTargets).forEach((key) => {
        const existingVector = key as ActivityVectorName
        if (existingVector !== vector && nextTargets[existingVector] === factionId) {
          delete nextTargets[existingVector]
        }
      })
    }
    if (factionId) {
      nextTargets[vector] = factionId
    } else {
      delete nextTargets[vector]
    }
    const nextIntent: PlayerIntent = { ...currentIntent, targets: nextTargets }
    set({
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(get().gameState, nextIntent),
    })
  },
  resetIntent: () => {
    const state = get().gameState
    const nextIntent = createIntentForState(state, 17)
    set({ playerIntent: nextIntent, forecast: forecastPlayerTurn(get().gameState, nextIntent) })
  },
  playNextSession: () => {
    const current = get().gameState
    const playerIntent = get().playerIntent
    const strategy = deriveStrategyFromIntent(playerIntent)
    const result = runSession(current, strategy, playerIntent)
    saveGameState(result.nextState)
    const nextIntent = createIntentForState(result.nextState)
    set({
      gameState: result.nextState,
      selectedFactionId: get().selectedFactionId,
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(result.nextState, nextIntent),
      lastOutcome: result.outcome,
    })
  },
  resetCampaign: () => {
    const nextState = createFreshState(DEFAULT_SEED)
    saveGameState(nextState)
    const nextIntent = createIntentForState(nextState)
    set({
      gameState: nextState,
      selectedFactionId: playerFactionId(nextState),
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(nextState, nextIntent),
      lastOutcome: null,
    })
  },
}))
