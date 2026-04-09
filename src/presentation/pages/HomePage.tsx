import { useGameStore } from '../../application/useGameStore'
import { PlayerStrategy } from '../../domain/gameModel'
import { PhaseSpaceChart } from '../components/PhaseSpaceChart'
import { SeasonStatusPanel } from '../components/SeasonStatusPanel'

export function HomePage() {
  const { gameState, strategy, lastOutcome, setStrategy, playNextSession, startCampaign, resetCampaign } = useGameStore()

  const playerFaction = gameState.factions.find((faction) => faction.isPlayer)
  const playerObjectives = gameState.seasonState.objectives.filter((objective) => objective.factionId === playerFaction?.id)
  const recentIntel = gameState.seasonState.intel.slice(-3)
  const recentLogs = gameState.seasonState.logs.slice(-4)

  return (
    <main className="shell">
      <header className="hero">
        <h1>Phase Dominion Prototype</h1>
        <p>Seasonal multi-faction strategy with progress-vs-sabotage decisions.</p>
      </header>

      <section className="controls-card">
        <label htmlFor="strategy">Player Strategy</label>
        <select
          id="strategy"
          value={strategy}
          onChange={(event) => setStrategy(event.target.value as PlayerStrategy)}
        >
          <option value="progress">Progress</option>
          <option value="balanced">Balanced</option>
          <option value="sabotage">Sabotage</option>
        </select>

        <div className="controls-row">
          <button onClick={() => playNextSession()} disabled={gameState.completed}>Run Next Session</button>
          <button onClick={() => startCampaign(Date.now())}>New Campaign</button>
          <button onClick={resetCampaign}>Reset Seeded Campaign</button>
        </div>

        {lastOutcome ? (
          <p className="outcome-line">
            {lastOutcome.summary} | Exposure +{lastOutcome.playerExposureDelta}
          </p>
        ) : (
          <p className="outcome-line">No session played yet. Configure strategy and run session 1.</p>
        )}
      </section>

      <SeasonStatusPanel gameState={gameState} />

      <section className="phase-primary">
        <PhaseSpaceChart factions={gameState.factions} isPrimary />
      </section>

      <section className="panel-grid-secondary">
        <article className="panel-card">
          <h3>Player Objectives</h3>
          <ul>
            {playerObjectives.map((objective) => (
              <li key={objective.id}>
                <strong>{objective.type}</strong> | {objective.priority} | status: {objective.status}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <h3>Recent Intel</h3>
          <ul>
            {recentIntel.map((intel) => (
              <li key={intel.id}>
                {intel.message} (confidence {intel.confidence.toFixed(2)})
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <h3>Resolution Logs</h3>
          <ul>
            {recentLogs.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}
