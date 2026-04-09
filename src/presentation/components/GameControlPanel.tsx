import { ACTIVITY_VECTORS, ActivityVectorName, Faction, GameState, PlayerIntent, SessionOutcome, TurnForecast } from '../../domain/gameModel'

interface GameControlPanelProps {
  gameState: GameState
  playerFaction: Faction
  selectedFaction: Faction
  playerIntent: PlayerIntent
  forecast: TurnForecast
  lastOutcome: SessionOutcome | null
  onSetIntentValue: (vector: ActivityVectorName, value: number) => void
  onResetIntent: () => void
  onRunSession: () => void
  onNewCampaign: () => void
  onResetCampaign: () => void
}

const VECTOR_LABELS: Record<ActivityVectorName, string> = {
  territorialPressure: 'Territorial Pressure',
  diplomaticMomentum: 'Diplomatic Momentum',
  economicThroughput: 'Economic Throughput',
  covertTempo: 'Covert Tempo',
  deterrencePosture: 'Deterrence Posture',
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`
}

export function GameControlPanel({
  gameState,
  playerFaction,
  selectedFaction,
  playerIntent,
  forecast,
  lastOutcome,
  onSetIntentValue,
  onResetIntent,
  onRunSession,
  onNewCampaign,
  onResetCampaign,
}: GameControlPanelProps) {
  const selectedObjectives = gameState.seasonState.objectives.filter((objective) => objective.factionId === selectedFaction.id)
  const recentIntel = gameState.seasonState.intel.slice(-4)
  const recentLogs = gameState.seasonState.logs.slice(-4)

  return (
    <aside className="game-side-panel">
      <section className="panel-section panel-section-header">
        <div>
          <p className="eyebrow">Campaign</p>
          <h2>Season {gameState.seasonState.seasonNumber}</h2>
          <p className="subline">
            Session {gameState.seasonState.sessionIndex}/{gameState.seasonState.maxSessions}
          </p>
          <p className="panel-note">{gameState.seasonState.briefing}</p>
        </div>
        <div className="hud-grid">
          <div>
            <span className="hud-label">Score</span>
            <strong>{playerFaction.score}</strong>
          </div>
          <div>
            <span className="hud-label">Resources</span>
            <strong>{playerFaction.resourceStock}</strong>
          </div>
          <div>
            <span className="hud-label">Exposure</span>
            <strong>{playerFaction.exposure}</strong>
          </div>
          <div>
            <span className="hud-label">Selected</span>
            <strong>{selectedFaction.name}</strong>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Command Vector</p>
            <h3>Next Iteration Plan</h3>
          </div>
          <button className="ghost-button" onClick={onResetIntent}>Reset Plan</button>
        </div>

        <div className="intent-list">
          {ACTIVITY_VECTORS.map((vector) => {
            const current = playerIntent.adjustments[vector]
            const projected = forecast.projectedVectors[vector]
            return (
              <label className="intent-row" key={vector}>
                <span>{VECTOR_LABELS[vector]}</span>
                <input
                  type="range"
                  min={-18}
                  max={18}
                  step={1}
                  value={current}
                  onChange={(event) => onSetIntentValue(vector, Number(event.target.value))}
                />
                <span className="intent-value">{formatSigned(current)}</span>
                <span className="intent-projection">→ {projected}</span>
              </label>
            )
          })}
        </div>

        <div className="forecast-grid">
          <div>
            <span className="hud-label">Derived Stance</span>
            <strong>{forecast.derivedStrategy}</strong>
          </div>
          <div>
            <span className="hud-label">Resource Delta</span>
            <strong>{formatSigned(forecast.resourceDelta)}</strong>
          </div>
          <div>
            <span className="hud-label">Exposure Delta</span>
            <strong>{formatSigned(forecast.exposureDelta)}</strong>
          </div>
          <div>
            <span className="hud-label">Score Pressure</span>
            <strong>{formatSigned(forecast.scorePressure)}</strong>
          </div>
        </div>

        <div className="control-actions">
          <button onClick={onRunSession} disabled={gameState.completed}>Commit Iteration</button>
          <button className="ghost-button" onClick={onNewCampaign}>New Campaign</button>
          <button className="ghost-button" onClick={onResetCampaign}>Reset Seed</button>
        </div>

        <p className="panel-note">
          Adjust the five activity vectors directly. The forecast reflects the projected player state for the next resolution step.
        </p>
        {lastOutcome ? <p className="outcome-line">{lastOutcome.summary}</p> : null}
      </section>

      <section className="panel-section">
        <p className="eyebrow">Faction Focus</p>
        <h3>{selectedFaction.name}</h3>
        <p className="panel-note">{selectedFaction.profile.doctrine}</p>
        <p className="panel-note">Led by {selectedFaction.profile.leaderName} from {selectedFaction.profile.homeBase}.</p>
        <p className="panel-note">Current agenda: {selectedFaction.profile.agenda}</p>
        <div className="detail-grid">
          <div>
            <span className="hud-label">Power Base</span>
            <strong>{selectedFaction.powerBase}</strong>
          </div>
          <div>
            <span className="hud-label">Agility</span>
            <strong>{selectedFaction.agility}</strong>
          </div>
          <div>
            <span className="hud-label">Influence</span>
            <strong>{selectedFaction.influence}</strong>
          </div>
          <div>
            <span className="hud-label">Resources</span>
            <strong>{selectedFaction.resourceStock}</strong>
          </div>
        </div>
        <ul className="compact-list">
          {selectedObjectives.map((objective) => (
            <li key={objective.id}>
              <strong>{objective.title ?? objective.type}</strong> • {objective.priority} • {objective.status}
              {objective.summary ? <div className="compact-subline">{objective.summary}</div> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-section panel-section-split">
        <div>
          <p className="eyebrow">Intel</p>
          <ul className="compact-list">
            {recentIntel.map((intel) => (
              <li key={intel.id}>
                <strong>{intel.sourceName ?? 'Unknown source'}</strong>: {intel.message}
                <div className="compact-subline">{intel.locationName ?? 'Unknown location'} • confidence {intel.confidence.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Resolution Feed</p>
          <ul className="compact-list">
            {recentLogs.map((logLine, index) => (
              <li key={`${logLine}-${index}`}>{logLine}</li>
            ))}
          </ul>
        </div>
      </section>
    </aside>
  )
}
