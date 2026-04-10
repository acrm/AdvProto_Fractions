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
        <div className="intent-star-core">
          <span className="intent-star-core-title">Unit Vector</span>
          <strong className="intent-star-core-value">||v|| = 1.00</strong>
          <span className="intent-star-core-note">Drag faction tokens between vertices. Sliders redistribute projection along the five rays.</span>
        </div>

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
                      className="faction-token faction-token-assigned"
                      draggable
                      onDragStart={(event) => handleDragStart(event, targetFaction.id)}
                      title="Drag token to swap faction targets"
                    >
                      <FactionIcon className="faction-token-icon" name={targetFaction.icon} />
                      <span>{targetFaction.name}</span>
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
                className="faction-token"
                draggable
                onDragStart={(event) => handleDragStart(event, faction.id)}
                title="Drag token to a vector vertex"
              >
                <FactionIcon className="faction-token-icon" name={faction.icon} />
                <span>{faction.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}