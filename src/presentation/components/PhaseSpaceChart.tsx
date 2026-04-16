import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ActivityVectorState, Faction } from '../../domain/gameModel'
import { FactionIcon } from './FactionIcon'

const DRAG_THRESHOLD_PX = 4
const MIN_ZOOM = 0.2
const MAX_ZOOM = 240
const ZOOM_FACTOR = 1.18

interface PhaseSpaceChartProps {
  factions: Faction[]
  selectedFactionId: string
  onSelectFaction: (factionId: string) => void
}

const COLORS = ['#b82030', '#c8922a', '#2a8c50', '#7040a8', '#cc7820', '#2870b8', '#a83060']
const TRAJECTORY_TAIL = 5
const MIN_VIEWPORT_WIDTH = 720
const MIN_VIEWPORT_HEIGHT = 540

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function mapClientPointToViewBox(
  eventTarget: SVGSVGElement,
  clientX: number,
  clientY: number,
  viewWidth: number,
  viewHeight: number,
): { x: number; y: number } {
  const rect = eventTarget.getBoundingClientRect()

  return {
    x: ((clientX - rect.left) / rect.width) * viewWidth,
    y: ((clientY - rect.top) / rect.height) * viewHeight,
  }
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
  const svgRef = useRef<SVGSVGElement | null>(null)
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

  useEffect(() => {
    const element = svgRef.current
    if (!element) return

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault()

      const pointer = mapClientPointToViewBox(
        element,
        event.clientX,
        event.clientY,
        viewport.width,
        viewport.height,
      )

      setZoom((currentZoom) => {
        const nextZoom = clamp(
          event.deltaY > 0 ? currentZoom / ZOOM_FACTOR : currentZoom * ZOOM_FACTOR,
          MIN_ZOOM,
          MAX_ZOOM,
        )

        setPan((currentPan) => {
          const worldX = (pointer.x - currentPan.x) / currentZoom
          const worldY = (pointer.y - currentPan.y) / currentZoom

          return {
            x: pointer.x - worldX * nextZoom,
            y: pointer.y - worldY * nextZoom,
          }
        })

        return nextZoom
      })
    }

    element.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleNativeWheel)
  }, [viewport.height, viewport.width])

  const viewWidth = viewport.width
  const viewHeight = viewport.height
  const centerX = viewWidth / 2
  const centerY = viewHeight / 2
  const baseRadius = Math.min(viewWidth, viewHeight) * 0.34
  const factionColorById = Object.fromEntries(
    factions.map((faction, index) => [faction.id, faction.isPlayer ? '#c8a870' : COLORS[index % COLORS.length]]),
  ) as Record<string, string>

  if (!playerFaction) {
    return (
      <div className="phase-card phase-card-primary">
        <h3>Phase Space</h3>
        <p>Player faction is missing. Unable to render player-centered projection.</p>
      </div>
    )
  }

  const selectFactionAtPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const pointer = mapClientPointToViewBox(event.currentTarget, event.clientX, event.clientY, viewWidth, viewHeight)
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
      const dx = pointer.x - candidate.x
      const dy = pointer.y - candidate.y
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
    const pointer = mapClientPointToViewBox(event.currentTarget, event.clientX, event.clientY, viewWidth, viewHeight)
    const originPointer = mapClientPointToViewBox(event.currentTarget, dragState.x, dragState.y, viewWidth, viewHeight)
    const panDx = pointer.x - originPointer.x
    const panDy = pointer.y - originPointer.y
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
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Faction activity phase space chart centered on player position"
          style={{ userSelect: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
        <rect x={0} y={0} width={viewWidth} height={viewHeight} fill="#0e0804" rx={0} />
        <g transform={`translate(${pan.x}, ${pan.y})`}>
        <g transform={`scale(${zoom})`}>
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx={centerX}
            cy={centerY}
            r={baseRadius * ratio}
            fill="none"
            stroke="#3a2310"
            strokeWidth={1 / zoom}
          />
        ))}

        <line x1={centerX - baseRadius} y1={centerY} x2={centerX + baseRadius} y2={centerY} stroke="#4a3018" strokeWidth={1.2 / zoom} />
        <line x1={centerX} y1={centerY - baseRadius} x2={centerX} y2={centerY + baseRadius} stroke="#4a3018" strokeWidth={1.2 / zoom} />

        <text x={centerX + baseRadius + 18 / zoom} y={centerY + 5 / zoom} fontSize={15 / zoom} fill="#c8a870">
          +Economic / +Diplomatic
        </text>
        <text x={centerX - baseRadius - 18 / zoom} y={centerY + 5 / zoom} textAnchor="end" fontSize={15 / zoom} fill="#c8a870">
          -Economic / -Diplomatic
        </text>
        <text x={centerX + 2 / zoom} y={centerY - baseRadius - 18 / zoom} textAnchor="middle" fontSize={15 / zoom} fill="#c8a870">
          +Covert / +Deterrence
        </text>
        <text x={centerX + 2 / zoom} y={centerY + baseRadius + 24 / zoom} textAnchor="middle" fontSize={15 / zoom} fill="#c8a870">
          -Covert / -Deterrence
        </text>

        <circle cx={centerX} cy={centerY} r={10 / zoom} fill={factionColorById[playerFaction.id]} stroke={selectedFactionId === playerFaction.id ? '#f0d898' : '#c8952a'} strokeWidth={2.5 / zoom} />
        <circle cx={centerX} cy={centerY} r={18 / zoom} fill="none" stroke={selectedFactionId === playerFaction.id ? '#d4982a' : '#e8c870'} strokeWidth={3.2 / zoom} strokeOpacity={0.95} />
        <foreignObject x={centerX - 7 / zoom} y={centerY - 7 / zoom} width={14 / zoom} height={14 / zoom} pointerEvents="none">
          <div className="phase-faction-glyph">
            <FactionIcon className="phase-faction-glyph-icon" name={playerFaction.icon} />
          </div>
        </foreignObject>

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
                  />
                  {points.map((point, pointIndex) => (
                    <g key={`${faction.id}-trail-${pointIndex}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={pointIndex === points.length - 1 ? rScaled : rTrail}
                        fill={factionColorById[faction.id]}
                        fillOpacity={point.opacity}
                        stroke={highlight ? '#f0d898' : '#c8a870'}
                        strokeWidth={(pointIndex === points.length - 1 ? 2.3 : 1.2) / zoom}
                      />
                      {pointIndex === points.length - 1 ? (
                        <foreignObject x={point.x - 7 / zoom} y={point.y - 7 / zoom} width={14 / zoom} height={14 / zoom} pointerEvents="none">
                          <div className="phase-faction-glyph">
                            <FactionIcon className="phase-faction-glyph-icon" name={faction.icon} />
                          </div>
                        </foreignObject>
                      ) : null}
                    </g>
                  ))}
                  {highlight ? (
                    <>
                      <circle
                        cx={currentPoint.x}
                        cy={currentPoint.y}
                        r={rScaled + 7 / zoom}
                        fill="none"
                        stroke="#d4982a"
                        strokeWidth={2.4 / zoom}
                      />
                      <text x={currentPoint.x + rScaled + 12 / zoom} y={currentPoint.y - rScaled - 8 / zoom} fontSize={14 / zoom} fill="#f0d898">
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
    </div>
  )
}
