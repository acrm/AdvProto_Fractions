import { GameState } from '../../domain/gameModel'

interface SeasonStatusPanelProps {
  gameState: GameState
}

export function SeasonStatusPanel({ gameState }: SeasonStatusPanelProps) {
  const season = gameState.seasonState
  const playerFaction = gameState.factions.find((faction) => faction.isPlayer)

  return (
    <section className="status-grid">
      <article className="status-card">
        <h3>Campaign State</h3>
        <p>Season: {season.seasonNumber}</p>
        <p>
          Session: {season.sessionIndex}/{season.maxSessions}
        </p>
        <p>Completed: {gameState.completed ? 'Yes' : 'No'}</p>
      </article>

      <article className="status-card">
        <h3>Player Faction</h3>
        <p>Name: {playerFaction?.name ?? 'Unknown'}</p>
        <p>Score: {playerFaction?.score ?? 0}</p>
        <p>Resources: {playerFaction?.resourceStock ?? 0}</p>
        <p>Exposure: {playerFaction?.exposure ?? 0}</p>
      </article>
    </section>
  )
}
