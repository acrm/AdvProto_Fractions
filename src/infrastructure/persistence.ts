import { GameState } from '../domain/gameModel'

const STORAGE_KEY = 'seasonal-faction-game-state'

function isNarrativeReadyState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as GameState
  return Array.isArray(candidate.factions)
    && candidate.factions.length > 0
    && candidate.factions.every((faction) => Boolean(faction.icon && faction.profile?.leaderName && faction.profile?.doctrine))
    && Boolean(candidate.seasonState?.briefing)
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadGameState(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    return isNarrativeReadyState(parsed) ? parsed : null
  } catch {
    return null
  }
}
