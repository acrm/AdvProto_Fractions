import { ActivityVectorName, Faction, PlayerIntent, SessionOutcome, TurnForecast } from '../../domain/gameModel'
import { VectorStarControls } from './VectorStarControls'

interface CommandPlanningPanelProps {
  factions: Faction[]
  playerIntent: PlayerIntent
  forecast: TurnForecast
  lastOutcome: SessionOutcome | null
  onSetIntentValue: (vector: ActivityVectorName, value: number) => void
  onSetIntentTarget: (vector: ActivityVectorName, factionId: string) => void
  onResetIntent: () => void
}

const FACTION_PALETTE = ['#b82030', '#c8922a', '#2a8c50', '#7040a8', '#cc7820', '#2870b8', '#a83060']

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

export function CommandPlanningPanel({
  factions,
  playerIntent,
  forecast,
  lastOutcome,
  onSetIntentValue,
  onSetIntentTarget,
  onResetIntent,
}: CommandPlanningPanelProps) {
  const factionColors = Object.fromEntries(
    factions.map((faction, index) => [faction.id, faction.isPlayer ? '#c8a870' : FACTION_PALETTE[index % FACTION_PALETTE.length]]),
  ) as Record<string, string>

  return (
    <section className="game-planning-panel">
      <div className="vector-section-layout">
        <div className="vector-section-summary">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Command Vector</p>
              <h3>Next Iteration Plan</h3>
            </div>
            <button className="ghost-button" onClick={onResetIntent}>Reset Plan</button>
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

          {lastOutcome ? <p className="outcome-line">{lastOutcome.summary}</p> : null}
        </div>

        <VectorStarControls
          factions={factions}
          factionColors={factionColors}
          playerIntent={playerIntent}
          forecast={forecast}
          onSetIntentValue={onSetIntentValue}
          onSetIntentTarget={onSetIntentTarget}
        />
      </div>
    </section>
  )
}