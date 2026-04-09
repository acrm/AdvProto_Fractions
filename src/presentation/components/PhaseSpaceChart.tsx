import { ActivityVectorState, Faction } from '../../domain/gameModel'

interface PhaseSpaceChartProps {
  factions: Faction[]
  isPrimary?: boolean
}

const COLORS = ['#005f73', '#ee9b00', '#9b2226', '#3a86ff', '#2a9d8f', '#6a4c93', '#ef476f']
const TRAJECTORY_TAIL = 5

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function projectRelativePoint(
  vectors: ActivityVectorState,
  playerVectors: ActivityVectorState,
  radius: number,
  center: number,
): { x: number; y: number } {
  const territorial = clamp(vectors.territorialPressure - playerVectors.territorialPressure, -200, 200)
  const diplomatic = clamp(vectors.diplomaticMomentum - playerVectors.diplomaticMomentum, -200, 200)
  const economic = clamp(vectors.economicThroughput - playerVectors.economicThroughput, -200, 200)
  const covert = clamp(vectors.covertTempo - playerVectors.covertTempo, -200, 200)
  const deterrence = clamp(vectors.deterrencePosture - playerVectors.deterrencePosture, -200, 200)

  const xRaw = 0.35 * diplomatic + 0.35 * economic + 0.2 * territorial - 0.1 * deterrence
  const yRaw = 0.45 * covert + 0.25 * deterrence - 0.2 * diplomatic - 0.1 * economic

  const xNorm = clamp(xRaw / 200, -1, 1)
  const yNorm = clamp(yRaw / 200, -1, 1)

  return {
    x: center + xNorm * radius,
    y: center - yNorm * radius,
  }
}

function trajectoryPoints(
  faction: Faction,
  playerFaction: Faction,
  radius: number,
  center: number,
): Array<{ x: number; y: number; opacity: number }> {
  const maxLength = Math.min(faction.trajectory.length, playerFaction.trajectory.length)
  if (maxLength === 0) return []

  const start = Math.max(0, maxLength - TRAJECTORY_TAIL)
  const total = maxLength - start
  const points: Array<{ x: number; y: number; opacity: number }> = []

  for (let index = start; index < maxLength; index += 1) {
    const point = projectRelativePoint(
      faction.trajectory[index],
      playerFaction.trajectory[index],
      radius,
      center,
    )

    const order = index - start + 1
    points.push({
      ...point,
      opacity: total <= 1 ? 1 : 0.25 + (order / total) * 0.75,
    })
  }

  return points
}

export function PhaseSpaceChart({ factions, isPrimary = false }: PhaseSpaceChartProps) {
  const size = isPrimary ? 760 : 420
  const center = size / 2
  const radius = isPrimary ? 280 : 150
  const axisPad = isPrimary ? 24 : 16
  const playerFaction = factions.find((faction) => faction.isPlayer)

  if (!playerFaction) {
    return (
      <div className="phase-card phase-card-primary">
        <h3>Phase Space</h3>
        <p>Player faction is missing. Unable to render player-centered projection.</p>
      </div>
    )
  }

  return (
    <div className={`phase-card ${isPrimary ? 'phase-card-primary' : ''}`.trim()}>
      <h3>Phase Space</h3>
      <p className="phase-subtitle">Player-centered projection. Dots show current stance, tails show last 5 sessions.</p>
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Faction activity phase space chart centered on player position"
      >
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx={center}
            cy={center}
            r={radius * ratio}
            fill="none"
            stroke="#d7dee3"
            strokeWidth={1}
          />
        ))}

        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#aab7c4" strokeWidth={1.2} />
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#aab7c4" strokeWidth={1.2} />

        <text x={center + radius + axisPad} y={center + 4} fontSize={isPrimary ? 15 : 13} fill="#1f2937">
          +Economic / +Diplomatic
        </text>
        <text x={center - radius - axisPad} y={center + 4} textAnchor="end" fontSize={isPrimary ? 15 : 13} fill="#1f2937">
          -Economic / -Diplomatic
        </text>
        <text x={center + 2} y={center - radius - axisPad} textAnchor="middle" fontSize={isPrimary ? 15 : 13} fill="#1f2937">
          +Covert / +Deterrence
        </text>
        <text x={center + 2} y={center + radius + axisPad} textAnchor="middle" fontSize={isPrimary ? 15 : 13} fill="#1f2937">
          -Covert / -Deterrence
        </text>

        <circle cx={center} cy={center} r={isPrimary ? 9 : 7} fill="#111827" stroke="#ffffff" strokeWidth={2} />
        <text x={center + 14} y={center - 12} fontSize={isPrimary ? 14 : 12} fill="#111827">Player Origin</text>

        {factions.map((faction, index) => (
          <g key={faction.id}>
            {!faction.isPlayer && (() => {
              const points = trajectoryPoints(faction, playerFaction, radius, center)
              if (points.length === 0) return null

              return (
                <>
                  <polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    strokeOpacity={0.45}
                  />
                  {points.map((point, pointIndex) => (
                    <circle
                      key={`${faction.id}-trail-${pointIndex}`}
                      cx={point.x}
                      cy={point.y}
                      r={pointIndex === points.length - 1 ? (isPrimary ? 8 : 6) : (isPrimary ? 5 : 4)}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={point.opacity}
                      stroke="#ffffff"
                      strokeWidth={pointIndex === points.length - 1 ? 1.8 : 1.2}
                    />
                  ))}
                </>
              )
            })()}
          </g>
        ))}
      </svg>
      <ul className="legend-list">
        {factions.map((faction, index) => (
          <li key={faction.id}>
            <span className="legend-chip" style={{ background: faction.isPlayer ? '#111827' : COLORS[index % COLORS.length] }} />
            {faction.name} {faction.isPlayer ? '(origin)' : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
