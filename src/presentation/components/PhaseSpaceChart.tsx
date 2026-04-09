import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { ActivityVectorState, Faction } from '../../domain/gameModel'

interface PhaseSpaceChartProps {
  factions: Faction[]
  selectedFactionId: string
  onSelectFaction: (factionId: string) => void
}

const COLORS = ['#005f73', '#ee9b00', '#9b2226', '#3a86ff', '#2a9d8f', '#6a4c93', '#ef476f']
const TRAJECTORY_TAIL = 5
const MIN_VIEWPORT_WIDTH = 720
const MIN_VIEWPORT_HEIGHT = 540

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function projectRelativePoint(
  vectors: ActivityVectorState,
  playerVectors: ActivityVectorState,
  radius: number,
  centerX: number,
  centerY: number,
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
    x: centerX + xNorm * radius,
    y: centerY - yNorm * radius,
  }
}

function pointRadius(resourceStock: number, maxResource: number): number {
  const safeMax = Math.max(1, maxResource)
  const normalized = Math.log(resourceStock + 1) / Math.log(safeMax + 1)
  return 7 + normalized * 15
}

function trajectoryPoints(
  faction: Faction,
  playerFaction: Faction,
  radius: number,
  centerX: number,
  centerY: number,
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
      centerX,
      centerY,
    )

    const order = index - start + 1
    points.push({
      ...point,
      opacity: total <= 1 ? 1 : 0.25 + (order / total) * 0.75,
    })
  }

  return points
}

export function PhaseSpaceChart({ factions, selectedFactionId, onSelectFaction }: PhaseSpaceChartProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragState, setDragState] = useState({ active: false, x: 0, y: 0, originX: 0, originY: 0 })
  const [viewport, setViewport] = useState({ width: 1000, height: 1000 })
  const playerFaction = factions.find((faction) => faction.isPlayer)
  const maxResource = Math.max(...factions.map((faction) => faction.resourceStock), 1)

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      setViewport({
        width: Math.max(MIN_VIEWPORT_WIDTH, Math.round(entry.contentRect.width)),
        height: Math.max(MIN_VIEWPORT_HEIGHT, Math.round(entry.contentRect.height)),
      })
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  const viewWidth = viewport.width
  const viewHeight = viewport.height
  const centerX = viewWidth / 2
  const centerY = viewHeight / 2
  const baseRadius = Math.min(viewWidth, viewHeight) * 0.34

  if (!playerFaction) {
    return (
      <div className="phase-card phase-card-primary">
        <h3>Phase Space</h3>
        <p>Player faction is missing. Unable to render player-centered projection.</p>
      </div>
    )
  }

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = ((event.clientX - rect.left) / rect.width) * viewWidth
    const pointerY = ((event.clientY - rect.top) / rect.height) * viewHeight

    setZoom((currentZoom) => {
      const nextZoom = clamp(currentZoom + (event.deltaY > 0 ? -0.12 : 0.12), 0.65, 2.4)
      const worldX = (pointerX - pan.x) / currentZoom
      const worldY = (pointerY - pan.y) / currentZoom

      setPan({
        x: pointerX - worldX * nextZoom,
        y: pointerY - worldY * nextZoom,
      })

      return nextZoom
    })
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragState({
      active: true,
      x: event.clientX,
      y: event.clientY,
      originX: pan.x,
      originY: pan.y,
    })
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragState.active) return
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = ((event.clientX - dragState.x) / rect.width) * viewWidth
    const dy = ((event.clientY - dragState.y) / rect.height) * viewHeight
    setPan({
      x: dragState.originX + dx,
      y: dragState.originY + dy,
    })
  }

  const handlePointerUp = (event?: ReactPointerEvent<SVGSVGElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragState((current) => ({ ...current, active: false }))
  }

  return (
    <div className="phase-board">
      <div className="phase-canvas" ref={canvasRef}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          role="img"
          aria-label="Faction activity phase space chart centered on player position"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
        <rect x={0} y={0} width={viewWidth} height={viewHeight} fill="#030712" rx={28} />
        <g transform={`translate(${pan.x}, ${pan.y})`}>
        <g transform={`scale(${zoom})`}>
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx={centerX}
            cy={centerY}
            r={baseRadius * ratio}
            fill="none"
            stroke="#183046"
            strokeWidth={1}
          />
        ))}

        <line x1={centerX - baseRadius} y1={centerY} x2={centerX + baseRadius} y2={centerY} stroke="#26455f" strokeWidth={1.2} />
        <line x1={centerX} y1={centerY - baseRadius} x2={centerX} y2={centerY + baseRadius} stroke="#26455f" strokeWidth={1.2} />

        <text x={centerX + baseRadius + 18} y={centerY + 5} fontSize={15} fill="#d0d8e6">
          +Economic / +Diplomatic
        </text>
        <text x={centerX - baseRadius - 18} y={centerY + 5} textAnchor="end" fontSize={15} fill="#d0d8e6">
          -Economic / -Diplomatic
        </text>
        <text x={centerX + 2} y={centerY - baseRadius - 18} textAnchor="middle" fontSize={15} fill="#d0d8e6">
          +Covert / +Deterrence
        </text>
        <text x={centerX + 2} y={centerY + baseRadius + 24} textAnchor="middle" fontSize={15} fill="#d0d8e6">
          -Covert / -Deterrence
        </text>

        <circle cx={centerX} cy={centerY} r={10} fill="#030712" stroke={selectedFactionId === playerFaction.id ? '#f8fafc' : '#60a5fa'} strokeWidth={2.5} />
        <circle cx={centerX} cy={centerY} r={18} fill="none" stroke={selectedFactionId === playerFaction.id ? '#f59e0b' : '#22d3ee'} strokeWidth={3.2} strokeOpacity={0.95} />
        <text x={centerX + 28} y={centerY - 22} fontSize={15} fill="#f8fafc">Player faction</text>

        {factions.map((faction, index) => (
          <g key={faction.id}>
            {!faction.isPlayer && (() => {
              const points = trajectoryPoints(faction, playerFaction, baseRadius, centerX, centerY)
              if (points.length === 0) return null
              const highlight = selectedFactionId === faction.id
              const currentPoint = points[points.length - 1]
              const radius = pointRadius(faction.resourceStock, maxResource)

              return (
                <>
                  <polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={highlight ? 5 : 3}
                    strokeOpacity={highlight ? 0.95 : 0.5}
                  />
                  <polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    onClick={() => onSelectFaction(faction.id)}
                  />
                  {points.map((point, pointIndex) => (
                    <circle
                      key={`${faction.id}-trail-${pointIndex}`}
                      cx={point.x}
                      cy={point.y}
                      r={pointIndex === points.length - 1 ? radius : Math.max(3, radius * 0.48)}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={point.opacity}
                      stroke={highlight ? '#f8fafc' : '#dbeafe'}
                      strokeWidth={pointIndex === points.length - 1 ? 2.3 : 1.2}
                      onClick={() => onSelectFaction(faction.id)}
                    />
                  ))}
                  {highlight ? (
                    <>
                      <circle
                        cx={currentPoint.x}
                        cy={currentPoint.y}
                        r={radius + 7}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={2.4}
                      />
                      <text x={currentPoint.x + radius + 12} y={currentPoint.y - radius - 8} fontSize={15} fill="#f8fafc">
                        {faction.name}
                      </text>
                    </>
                  ) : null}
                </>
              )
            })()}
          </g>
        ))}
        </g>
        </g>
        </svg>
      </div>
      <ul className="legend-list">
        {factions.map((faction, index) => (
          <li key={faction.id} className={selectedFactionId === faction.id ? 'legend-active' : ''}>
            <button type="button" className="legend-button" onClick={() => onSelectFaction(faction.id)}>
              <span className="legend-chip" style={{ background: faction.isPlayer ? '#111827' : COLORS[index % COLORS.length] }} />
              {faction.name} {faction.isPlayer ? '(origin)' : ''}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
