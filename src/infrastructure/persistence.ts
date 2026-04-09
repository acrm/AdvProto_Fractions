import { GameState } from '../domain/gameModel'

const STORAGE_KEY = 'seasonal-faction-game-state'

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadGameState(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}
