import { create } from 'zustand'
import {
  createDefaultGameConfig,
  createEmptyPlayerIntent,
  createInitialGameState,
  deriveStrategyFromIntent,
  forecastPlayerTurn,
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

const persisted = loadGameState()
const initialState = persisted ?? createFreshState(DEFAULT_SEED)
const initialIntent = createEmptyPlayerIntent()

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: initialState,
  selectedFactionId: playerFactionId(initialState),
  playerIntent: initialIntent,
  lastOutcome: null,
  forecast: forecastPlayerTurn(initialState, initialIntent),
  startCampaign: (seed) => {
    const nextState = createFreshState(seed ?? DEFAULT_SEED)
    saveGameState(nextState)
    const nextIntent = createEmptyPlayerIntent()
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
    const nextIntent = {
      adjustments: {
        ...currentIntent.adjustments,
        [vector]: value,
      },
    }

    set({
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(get().gameState, nextIntent),
    })
  },
  resetIntent: () => {
    const nextIntent = createEmptyPlayerIntent()
    set({ playerIntent: nextIntent, forecast: forecastPlayerTurn(get().gameState, nextIntent) })
  },
  playNextSession: () => {
    const current = get().gameState
    const playerIntent = get().playerIntent
    const strategy = deriveStrategyFromIntent(playerIntent)
    const result = runSession(current, strategy, playerIntent)
    saveGameState(result.nextState)
    const nextIntent = createEmptyPlayerIntent()
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
    const nextIntent = createEmptyPlayerIntent()
    set({
      gameState: nextState,
      selectedFactionId: playerFactionId(nextState),
      playerIntent: nextIntent,
      forecast: forecastPlayerTurn(nextState, nextIntent),
      lastOutcome: null,
    })
  },
}))
