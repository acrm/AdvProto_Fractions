import type { CSSProperties, DragEvent } from 'react'
import { ACTIVITY_VECTORS, ActivityVectorName, Faction, PlayerIntent, TurnForecast } from '../../domain/gameModel'
import { FactionIcon, VECTOR_ICONS } from './FactionIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const VECTOR_LABELS: Record<ActivityVectorName, string> = {
  territorialPressure: 'Territorial Pressure',
  diplomaticMomentum: 'Diplomatic Momentum',
  economicThroughput: 'Economic Throughput',
  covertTempo: 'Covert Tempo',
  deterrencePosture: 'Deterrence Posture',
}

const VECTOR_HINTS: Record<ActivityVectorName, string> = {
  territorialPressure: 'Physical expansion and control of routes and positions.',
  diplomaticMomentum: 'Political leverage, negotiations, and legitimacy.',
  economicThroughput: 'Supply, extraction, transport, and resource flow.',
  covertTempo: 'Speed and intensity of deniable covert operations.',
  deterrencePosture: 'Hard-power readiness and intimidation pressure.',
}

const VECTOR_ANGLES: Record<ActivityVectorName, number> = {
  territorialPressure: -90,
  diplomaticMomentum: -18,
  economicThroughput: 54,
  covertTempo: 126,
  deterrencePosture: 198,
}

interface VectorStarControlsProps {
  playerIntent: PlayerIntent
  forecast: TurnForecast
  factions: Faction[]
  factionColors: Record<string, string>
  onSetIntentValue: (vector: ActivityVectorName, value: number) => void
  onSetIntentTarget: (vector: ActivityVectorName, factionId: string) => void
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

export function VectorStarControls({
  playerIntent,
  forecast,
  factions,
  factionColors,
  onSetIntentValue,
  onSetIntentTarget,
}: VectorStarControlsProps) {
  const nonPlayerFactions = factions.filter((faction) => !faction.isPlayer)
  const assignedIds = new Set(Object.values(playerIntent.targets).filter((target): target is string => Boolean(target)))
  const reserveFactions = nonPlayerFactions.filter((faction) => !assignedIds.has(faction.id))

  const findVectorByFaction = (factionId: string): ActivityVectorName | undefined => (
    ACTIVITY_VECTORS.find((vector) => playerIntent.targets[vector] === factionId)
  )

  const moveTarget = (factionId: string, targetVector: ActivityVectorName) => {
    const sourceVector = findVectorByFaction(factionId)
    const displacedFactionId = playerIntent.targets[targetVector]

    if (sourceVector === targetVector) return

    if (sourceVector && displacedFactionId) {
      onSetIntentTarget(sourceVector, displacedFactionId)
      onSetIntentTarget(targetVector, factionId)
      return
    }

    onSetIntentTarget(targetVector, factionId)
  }

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, factionId: string) => {
    event.dataTransfer.setData('text/plain', factionId)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, vector: ActivityVectorName) => {
    event.preventDefault()
    const factionId = event.dataTransfer.getData('text/plain')
    if (factionId) {
      moveTarget(factionId, vector)
    }
  }

  return (
    <div className="intent-star-shell">
      <div className="intent-star-board">
        {ACTIVITY_VECTORS.map((vector) => {
          const currentValue = playerIntent.adjustments[vector]
          const effectiveValue = forecast.normalizedAdjustments[vector]
          const targetFaction = nonPlayerFactions.find((faction) => faction.id === playerIntent.targets[vector])
          const rayStyle = { '--ray-angle': `${VECTOR_ANGLES[vector]}deg` } as CSSProperties

          return (
            <div className="intent-ray" key={vector} style={rayStyle}>
              <div className="intent-ray-track">
                <input
                  aria-label={VECTOR_LABELS[vector]}
                  className="intent-ray-slider"
                  type="range"
                  min={-1}
                  max={1}
                  step={0.01}
                  value={currentValue}
                  onChange={(event) => onSetIntentValue(vector, Number(event.target.value))}
                />
              </div>

              <div className="intent-vertex" onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, vector)}>
                <div className="intent-vertex-card">
                  <div className="intent-vertex-title" title={VECTOR_HINTS[vector]}>
                    <FontAwesomeIcon icon={VECTOR_ICONS[vector]} fixedWidth />
                    <span>{VECTOR_LABELS[vector]}</span>
                  </div>
                  <div className="intent-vertex-values">
                    <span>{formatSigned(currentValue)}</span>
                    <span className="intent-vertex-effective">→ {formatSigned(effectiveValue)}</span>
                  </div>
                  {targetFaction ? (
                    <button
                      type="button"
                      className="faction-token faction-token-assigned faction-token-dot"
                      draggable
                      onDragStart={(event) => handleDragStart(event, targetFaction.id)}
                      title="Drag token to swap faction targets"
                      style={{
                        background: factionColors[targetFaction.id],
                        borderColor: factionColors[targetFaction.id],
                      }}
                    >
                      <FactionIcon className="faction-token-icon" name={targetFaction.icon} />
                    </button>
                  ) : (
                    <div className="intent-vertex-empty">No assigned target</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {reserveFactions.length > 0 ? (
        <div className="intent-reserve-row">
          <span className="intent-pool-label">Reserve tokens</span>
          <div className="intent-pool-tokens">
            {reserveFactions.map((faction) => (
              <button
                type="button"
                key={faction.id}
                className="faction-token faction-token-dot"
                draggable
                onDragStart={(event) => handleDragStart(event, faction.id)}
                title="Drag token to a vector vertex"
                style={{
                  background: factionColors[faction.id],
                  borderColor: factionColors[faction.id],
                }}
              >
                <FactionIcon className="faction-token-icon" name={faction.icon} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}