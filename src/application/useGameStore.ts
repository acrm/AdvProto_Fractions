import { create } from 'zustand'
import { createDefaultGameConfig, createInitialGameState, runSession } from '../domain/gameRules'
import { GameState, PlayerStrategy, SessionOutcome } from '../domain/gameModel'
import { loadGameState, saveGameState } from '../infrastructure/persistence'

interface GameStoreState {
  gameState: GameState
  strategy: PlayerStrategy
  lastOutcome: SessionOutcome | null
  startCampaign: (seed?: number) => void
  setStrategy: (strategy: PlayerStrategy) => void
  playNextSession: () => void
  resetCampaign: () => void
}

const DEFAULT_SEED = 20260409
const DEFAULT_CONFIG = createDefaultGameConfig()

function createFreshState(seed: number): GameState {
  return createInitialGameState(seed, DEFAULT_CONFIG)
}

const persisted = loadGameState()
const initialState = persisted ?? createFreshState(DEFAULT_SEED)

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: initialState,
  strategy: 'balanced',
  lastOutcome: null,
  startCampaign: (seed) => {
    const nextState = createFreshState(seed ?? DEFAULT_SEED)
    saveGameState(nextState)
    set({ gameState: nextState, lastOutcome: null, strategy: 'balanced' })
  },
  setStrategy: (strategy) => set({ strategy }),
  playNextSession: () => {
    const current = get().gameState
    const strategy = get().strategy
    const result = runSession(current, strategy)
    saveGameState(result.nextState)
    set({ gameState: result.nextState, lastOutcome: result.outcome })
  },
  resetCampaign: () => {
    const nextState = createFreshState(DEFAULT_SEED)
    saveGameState(nextState)
    set({ gameState: nextState, lastOutcome: null, strategy: 'balanced' })
  },
}))
