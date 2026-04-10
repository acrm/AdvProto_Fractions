import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { ActivityVectorState, Faction } from '../../domain/gameModel'

const DRAG_THRESHOLD_PX = 4
const MIN_ZOOM = 0.2
const MAX_ZOOM = 240
const ZOOM_FACTOR = 1.18

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
  const dragMovedRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
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
      const nextZoom = clamp(
        event.deltaY > 0 ? currentZoom / ZOOM_FACTOR : currentZoom * ZOOM_FACTOR,
        MIN_ZOOM,
        MAX_ZOOM,
      )

      setPan((currentPan) => {
        const worldX = (pointerX - currentPan.x) / currentZoom
        const worldY = (pointerY - currentPan.y) / currentZoom
        return {
          x: pointerX - worldX * nextZoom,
          y: pointerY - worldY * nextZoom,
        }
      })

      return nextZoom
    })
  }

  const selectFactionAtPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = ((event.clientX - rect.left) / rect.width) * viewWidth
    const pointerY = ((event.clientY - rect.top) / rect.height) * viewHeight
    const candidates: Array<{ id: string; x: number; y: number; hitRadius: number }> = []

    candidates.push({
      id: playerFaction.id,
      x: centerX * zoom + pan.x,
      y: centerY * zoom + pan.y,
      hitRadius: 20,
    })

    factions.forEach((faction) => {
      if (faction.isPlayer) return

      const points = trajectoryPoints(faction, playerFaction, baseRadius, centerX, centerY)
      const currentPoint = points[points.length - 1] ?? projectRelativePoint(faction.vectors, playerFaction.vectors, baseRadius, centerX, centerY)
      const visibleRadius = pointRadius(faction.resourceStock, maxResource)

      candidates.push({
        id: faction.id,
        x: currentPoint.x * zoom + pan.x,
        y: currentPoint.y * zoom + pan.y,
        hitRadius: Math.max(14, visibleRadius + 8),
      })
    })

    let bestId: string | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    candidates.forEach((candidate) => {
      const dx = pointerX - candidate.x
      const dy = pointerY - candidate.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance <= candidate.hitRadius && distance < bestDistance) {
        bestDistance = distance
        bestId = candidate.id
      }
    })

    if (bestId) onSelectFaction(bestId)
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragMovedRef.current = false
    dragStartRef.current = { x: event.clientX, y: event.clientY }
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
    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y
    if (!dragMovedRef.current && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) {
      dragMovedRef.current = true
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const panDx = ((event.clientX - dragState.x) / rect.width) * viewWidth
    const panDy = ((event.clientY - dragState.y) / rect.height) * viewHeight
    setPan({
      x: dragState.originX + panDx,
      y: dragState.originY + panDy,
    })
  }

  const handlePointerUp = (event?: ReactPointerEvent<SVGSVGElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (event && !dragMovedRef.current) {
      selectFactionAtPointer(event)
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
          style={{ userSelect: 'none' }}
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
            strokeWidth={1 / zoom}
          />
        ))}

        <line x1={centerX - baseRadius} y1={centerY} x2={centerX + baseRadius} y2={centerY} stroke="#26455f" strokeWidth={1.2 / zoom} />
        <line x1={centerX} y1={centerY - baseRadius} x2={centerX} y2={centerY + baseRadius} stroke="#26455f" strokeWidth={1.2 / zoom} />

        <text x={centerX + baseRadius + 18 / zoom} y={centerY + 5 / zoom} fontSize={15 / zoom} fill="#d0d8e6">
          +Economic / +Diplomatic
        </text>
        <text x={centerX - baseRadius - 18 / zoom} y={centerY + 5 / zoom} textAnchor="end" fontSize={15 / zoom} fill="#d0d8e6">
          -Economic / -Diplomatic
        </text>
        <text x={centerX + 2 / zoom} y={centerY - baseRadius - 18 / zoom} textAnchor="middle" fontSize={15 / zoom} fill="#d0d8e6">
          +Covert / +Deterrence
        </text>
        <text x={centerX + 2 / zoom} y={centerY + baseRadius + 24 / zoom} textAnchor="middle" fontSize={15 / zoom} fill="#d0d8e6">
          -Covert / -Deterrence
        </text>

        <circle cx={centerX} cy={centerY} r={10 / zoom} fill="#030712" stroke={selectedFactionId === playerFaction.id ? '#f8fafc' : '#60a5fa'} strokeWidth={2.5 / zoom} />
        <circle cx={centerX} cy={centerY} r={18 / zoom} fill="none" stroke={selectedFactionId === playerFaction.id ? '#f59e0b' : '#22d3ee'} strokeWidth={3.2 / zoom} strokeOpacity={0.95} />
        <text x={centerX + 28 / zoom} y={centerY - 22 / zoom} fontSize={15 / zoom} fill="#f8fafc">Player</text>

        {factions.map((faction, index) => (
          <g key={faction.id}>
            {!faction.isPlayer && (() => {
              const points = trajectoryPoints(faction, playerFaction, baseRadius, centerX, centerY)
              if (points.length === 0) return null
              const highlight = selectedFactionId === faction.id
              const currentPoint = points[points.length - 1]
              const radius = pointRadius(faction.resourceStock, maxResource)
              const rScaled = radius / zoom
              const rTrail = Math.max(2, radius * 0.48) / zoom

              return (
                <>
                  <polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={(highlight ? 5 : 3) / zoom}
                    strokeOpacity={highlight ? 0.95 : 0.5}
                  />
                  <polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={28 / zoom}
                    onClick={() => { if (!dragMovedRef.current) onSelectFaction(faction.id) }}
                  />
                  {points.map((point, pointIndex) => (
                    <circle
                      key={`${faction.id}-trail-${pointIndex}`}
                      cx={point.x}
                      cy={point.y}
                      r={pointIndex === points.length - 1 ? rScaled : rTrail}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={point.opacity}
                      stroke={highlight ? '#f8fafc' : '#dbeafe'}
                      strokeWidth={(pointIndex === points.length - 1 ? 2.3 : 1.2) / zoom}
                      onClick={() => { if (!dragMovedRef.current) onSelectFaction(faction.id) }}
                    />
                  ))}
                  {highlight ? (
                    <>
                      <circle
                        cx={currentPoint.x}
                        cy={currentPoint.y}
                        r={rScaled + 7 / zoom}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={2.4 / zoom}
                      />
                      <text x={currentPoint.x + rScaled + 12 / zoom} y={currentPoint.y - rScaled - 8 / zoom} fontSize={14 / zoom} fill="#f8fafc">
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
              <span className="legend-icon">{faction.icon}</span>
              {faction.name} {faction.isPlayer ? '(origin)' : ''}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
