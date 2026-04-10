import { ActivityVectorName, Faction, GameState, PlayerIntent, SessionOutcome, TurnForecast } from '../../domain/gameModel'
import { FactionIcon } from './FactionIcon'
import { VectorStarControls } from './VectorStarControls'

interface GameControlPanelProps {
  gameState: GameState
  playerFaction: Faction
  selectedFaction: Faction
  playerIntent: PlayerIntent
  forecast: TurnForecast
  lastOutcome: SessionOutcome | null
  onSelectFaction: (factionId: string) => void
  onSetIntentValue: (vector: ActivityVectorName, value: number) => void
  onSetIntentTarget: (vector: ActivityVectorName, factionId: string) => void
  onResetIntent: () => void
  onRunSession: () => void
  onNewCampaign: () => void
  onResetCampaign: () => void
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

export function GameControlPanel({
  gameState,
  playerFaction,
  selectedFaction,
  playerIntent,
  forecast,
  lastOutcome,
  onSelectFaction,
  onSetIntentValue,
  onSetIntentTarget,
  onResetIntent,
  onRunSession,
  onNewCampaign,
  onResetCampaign,
}: GameControlPanelProps) {
  const selectedObjectives = gameState.seasonState.objectives.filter((objective) => objective.factionId === selectedFaction.id)
  const recentIntel = gameState.seasonState.intel
    .filter((intel) => intel.aboutFactionId === selectedFaction.id)
    .slice(-5)
  const recentLogs = gameState.seasonState.logs.slice(-6)
  const factionPalette = ['#b82030', '#c8922a', '#2a8c50', '#7040a8', '#cc7820', '#2870b8', '#a83060']
  const factionColors = Object.fromEntries(
    gameState.factions.map((faction, index) => [faction.id, faction.isPlayer ? '#c8a870' : factionPalette[index % factionPalette.length]]),
  ) as Record<string, string>

  return (
    <aside className="game-side-panel">
      <section className="panel-section panel-section-status">
        <p className="eyebrow">Campaign Status</p>
        <h2>Season {gameState.seasonState.seasonNumber}</h2>
        <p className="subline">
          Iteration {gameState.seasonState.sessionIndex}/{gameState.seasonState.maxSessions}
        </p>
      </section>

      <section className="panel-section panel-section-header">
        <p className="panel-note">{gameState.seasonState.briefing}</p>
        <div className="control-actions control-actions-header">
          <button onClick={onRunSession} disabled={gameState.completed}>Commit Iteration</button>
          <button className="ghost-button" onClick={onNewCampaign}>New Campaign</button>
          <button className="ghost-button" onClick={onResetCampaign}>Reset Seed</button>
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

        <VectorStarControls
          factions={gameState.factions}
          factionColors={factionColors}
          playerIntent={playerIntent}
          forecast={forecast}
          onSetIntentValue={onSetIntentValue}
          onSetIntentTarget={onSetIntentTarget}
        />
      </section>

      <section className="panel-section">
        <p className="eyebrow">Faction List</p>
        <ul className="faction-roster-list">
          {gameState.factions.map((faction) => (
            <li key={faction.id}>
              <button
                type="button"
                className={`faction-roster-item ${selectedFaction.id === faction.id ? 'faction-roster-item-active' : ''}`}
                onClick={() => onSelectFaction(faction.id)}
              >
                <span className="faction-roster-color" style={{ background: factionColors[faction.id] }} />
                <FactionIcon name={faction.icon} />
                <span>{faction.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-section panel-section-fill">
        <p className="eyebrow">Faction Focus</p>
        <h3 className="faction-heading"><FactionIcon name={selectedFaction.icon} /> {selectedFaction.name}</h3>
        <p className="panel-note">{selectedFaction.profile.doctrine}</p>
        <p className="panel-note">Led by {selectedFaction.profile.leaderName} from {selectedFaction.profile.homeBase}.</p>
        <p className="panel-note">Current agenda: {selectedFaction.profile.agenda}</p>

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

        <p className="panel-note">
          Intent vector is always unit length. You redistribute one fixed direction budget across five components.
        </p>
        {lastOutcome ? <p className="outcome-line">{lastOutcome.summary}</p> : null}

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
        <div>
          <p className="eyebrow">Intel On Selected Faction</p>
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
          <p className="eyebrow">Recent Resolution Feed</p>
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
