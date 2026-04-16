import { Faction, GameState } from '../../domain/gameModel'
import { FactionIcon } from './FactionIcon'
import { FitScalePanel } from './FitScalePanel'

interface GameStatePanelProps {
  gameState: GameState
}

interface CampaignStatusPanelProps extends GameStatePanelProps {
  onRunSession: () => void
  onNewCampaign: () => void
  onResetCampaign: () => void
}

interface FactionRosterPanelProps extends GameStatePanelProps {
  selectedFaction: Faction
  onSelectFaction: (factionId: string) => void
}

interface FactionFocusPanelProps {
  selectedFaction: Faction
}

function createFactionColors(gameState: GameState): Record<string, string> {
  const factionPalette = ['#b82030', '#c8922a', '#2a8c50', '#7040a8', '#cc7820', '#2870b8', '#a83060']

  return Object.fromEntries(
    gameState.factions.map((faction, index) => [faction.id, faction.isPlayer ? '#c8a870' : factionPalette[index % factionPalette.length]]),
  ) as Record<string, string>
}

export function CampaignStatusPanel({
  gameState,
  onRunSession,
  onNewCampaign,
  onResetCampaign,
}: CampaignStatusPanelProps) {
  return (
    <section className="dashboard-panel dashboard-panel-status">
      <FitScalePanel baseWidth={660}>
        <section className="panel-section panel-section-status dashboard-panel-content dashboard-status-content">
          <div className="campaign-status-grid">
            <div>
              <p className="eyebrow">Campaign Status</p>
              <h2>Season {gameState.seasonState.seasonNumber}</h2>
              <p className="subline">
                Iteration {gameState.seasonState.sessionIndex}/{gameState.seasonState.maxSessions}
              </p>
            </div>
            <div className="control-actions control-actions-status">
              <button onClick={onRunSession} disabled={gameState.completed}>Commit Iteration</button>
              <button className="ghost-button" onClick={onNewCampaign}>New Campaign</button>
              <button className="ghost-button" onClick={onResetCampaign}>Reset Seed</button>
            </div>
          </div>
          <p className="panel-note">{gameState.seasonState.briefing}</p>
        </section>
      </FitScalePanel>
    </section>
  )
}

export function FactionRosterPanel({ gameState, selectedFaction, onSelectFaction }: FactionRosterPanelProps) {
  const factionColors = createFactionColors(gameState)

  return (
    <section className="dashboard-panel dashboard-panel-roster">
      <FitScalePanel baseWidth={980}>
        <section className="panel-section panel-section-list dashboard-panel-content dashboard-roster-content">
          <p className="eyebrow">Faction List</p>
          <ul className="faction-roster-list">
            {gameState.factions.map((faction) => (
              <li key={faction.id}>
                <button
                  type="button"
                  className={`faction-roster-item ${selectedFaction.id === faction.id ? 'faction-roster-item-active' : ''}`}
                  onClick={() => onSelectFaction(faction.id)}
                >
                  <span className="faction-list-token" style={{ background: factionColors[faction.id], borderColor: factionColors[faction.id] }}>
                    <FactionIcon className="faction-token-icon" name={faction.icon} />
                  </span>
                  <span className="faction-roster-copy">
                    <span className="faction-roster-name">{faction.name}</span>
                    <span className="faction-roster-subline">
                      {faction.isPlayer ? 'Player Command' : faction.profile.sphere}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </FitScalePanel>
    </section>
  )
}

export function FactionFocusPanel({ selectedFaction }: FactionFocusPanelProps) {
  return (
    <section className="dashboard-panel dashboard-panel-focus">
      <FitScalePanel baseWidth={860}>
        <section className="panel-section panel-section-fill dashboard-panel-content dashboard-focus-content">
          <p className="eyebrow">Faction Focus</p>
          <h3 className="faction-heading"><FactionIcon name={selectedFaction.icon} /> {selectedFaction.name}</h3>
          <p className="panel-note">{selectedFaction.profile.doctrine}</p>
          <div className="focus-summary-grid">
            <div>
              <span className="hud-label">Sphere</span>
              <strong>{selectedFaction.profile.sphere}</strong>
            </div>
            <div>
              <span className="hud-label">Methods</span>
              <strong>{selectedFaction.profile.methods}</strong>
            </div>
            <div>
              <span className="hud-label">Leader</span>
              <strong>{selectedFaction.profile.leaderName}</strong>
            </div>
            <div>
              <span className="hud-label">Home Base</span>
              <strong>{selectedFaction.profile.homeBase}</strong>
            </div>
          </div>
          <p className="panel-note">Current agenda: {selectedFaction.profile.agenda}</p>

          <div className="detail-grid detail-grid-large">
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
            <div>
              <span className="hud-label">Exposure</span>
              <strong>{selectedFaction.exposure}</strong>
            </div>
            <div>
              <span className="hud-label">Score</span>
              <strong>{selectedFaction.score}</strong>
            </div>
          </div>
        </section>
      </FitScalePanel>
    </section>
  )
}

function createSeasonEntries(gameState: GameState): Array<{ label: string; text: string }> {
  const sourceLines = gameState.seasonState.logs.length > 0
    ? gameState.seasonState.logs
    : (gameState.seasonState.briefing ? [gameState.seasonState.briefing] : [])

  let iterationIndex = 0

  return sourceLines.map((text, index) => {
    if (index === 0) {
      return { label: 'Season Opening', text }
    }

    if (/season\s+\d+\s+closed/i.test(text) || /season\s+closed/i.test(text)) {
      return { label: 'Season Closed', text }
    }

    iterationIndex += 1
    return {
      label: `Iteration ${iterationIndex}`,
      text,
    }
  })
}

export function SeasonIterationPanel({ gameState }: GameStatePanelProps) {
  const entries = createSeasonEntries(gameState)

  return (
    <section className="dashboard-panel dashboard-panel-season">
      <FitScalePanel baseWidth={720}>
        <section className="panel-section panel-section-fill dashboard-panel-content dashboard-season-content">
          <p className="eyebrow">Season Summaries</p>
          <div className="season-iteration-list">
            {entries.map((entry, index) => (
              <article className="season-iteration-card" key={`${entry.label}-${index}`}>
                <p className="eyebrow">{entry.label}</p>
                <p className="season-iteration-text">{entry.text}</p>
              </article>
            ))}
          </div>
        </section>
      </FitScalePanel>
    </section>
  )
}
