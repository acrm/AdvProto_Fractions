import { ACTIVITY_VECTORS, ActivityVectorState, Faction } from '../../domain/gameModel'

interface PhaseSpaceChartProps {
  factions: Faction[]
}

const LABELS: Record<(typeof ACTIVITY_VECTORS)[number], string> = {
  territorialPressure: 'Territorial',
  diplomaticMomentum: 'Diplomatic',
  economicThroughput: 'Economic',
  covertTempo: 'Covert',
  deterrencePosture: 'Deterrence',
}

const COLORS = ['#005f73', '#ee9b00', '#9b2226', '#3a86ff', '#2a9d8f', '#6a4c93', '#ef476f']

function pointForAxis(axisIndex: number, value: number, radius: number, center: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * axisIndex) / ACTIVITY_VECTORS.length - Math.PI / 2
  const normalized = (value + 100) / 200
  const scaled = normalized * radius

  return {
    x: center + Math.cos(angle) * scaled,
    y: center + Math.sin(angle) * scaled,
  }
}

function polygonPoints(vectors: ActivityVectorState, radius: number, center: number): string {
  return ACTIVITY_VECTORS.map((axis, index) => {
    const point = pointForAxis(index, vectors[axis], radius, center)
    return `${point.x},${point.y}`
  }).join(' ')
}

export function PhaseSpaceChart({ factions }: PhaseSpaceChartProps) {
  const size = 380
  const center = size / 2
  const radius = 130

  return (
    <div className="phase-card">
      <h3>Phase Space</h3>
      <svg width={size} height={size} role="img" aria-label="Faction activity phase space chart">
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

        {ACTIVITY_VECTORS.map((axis, index) => {
          const outer = pointForAxis(index, 100, radius, center)
          return (
            <g key={axis}>
              <line x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#b5c3cf" strokeWidth={1.2} />
              <text x={outer.x} y={outer.y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#1f2937">
                {LABELS[axis]}
              </text>
            </g>
          )
        })}

        {factions.map((faction, index) => (
          <g key={faction.id}>
            <polygon
              points={polygonPoints(faction.vectors, radius, center)}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.16}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>
      <ul className="legend-list">
        {factions.map((faction, index) => (
          <li key={faction.id}>
            <span className="legend-chip" style={{ background: COLORS[index % COLORS.length] }} />
            {faction.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
