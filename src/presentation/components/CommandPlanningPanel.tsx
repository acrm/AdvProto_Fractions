import { ActivityVectorName, Faction, PlayerIntent, TurnForecast } from '../../domain/gameModel'
import { FitScalePanel } from './FitScalePanel'
import { VectorStarControls } from './VectorStarControls'

interface CommandPlanningPanelProps {
  factions: Faction[]
  playerIntent: PlayerIntent
  forecast: TurnForecast
  onSetIntentValue: (vector: ActivityVectorName, value: number) => void
  onSetIntentTarget: (vector: ActivityVectorName, factionId: string) => void
  onResetIntent: () => void
}

const FACTION_PALETTE = ['#b82030', '#c8922a', '#2a8c50', '#7040a8', '#cc7820', '#2870b8', '#a83060']

export function CommandPlanningPanel({
  factions,
  playerIntent,
  forecast,
  onSetIntentValue,
  onSetIntentTarget,
  onResetIntent,
}: CommandPlanningPanelProps) {
  const factionColors = Object.fromEntries(
    factions.map((faction, index) => [faction.id, faction.isPlayer ? '#c8a870' : FACTION_PALETTE[index % FACTION_PALETTE.length]]),
  ) as Record<string, string>

  return (
    <section className="game-planning-panel">
      <FitScalePanel baseWidth={600}>
        <div className="game-planning-panel-content vector-section-layout">
          <VectorStarControls
            factions={factions}
            factionColors={factionColors}
            playerIntent={playerIntent}
            forecast={forecast}
            onSetIntentValue={onSetIntentValue}
            onSetIntentTarget={onSetIntentTarget}
            onResetIntent={onResetIntent}
          />
        </div>
      </FitScalePanel>
    </section>
  )
}