import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../application/useGameStore'
import { Faction } from '../../domain/gameModel'
import { CommandPlanningPanel } from '../components/CommandPlanningPanel'
import { CampaignStatusPanel, FactionFocusPanel, FactionRosterPanel } from '../components/GameControlPanel'
import { PhaseSpaceChart } from '../components/PhaseSpaceChart'

const DESKTOP_BREAKPOINT_PX = 1180
const MIN_TOP_ROW_HEIGHT_PX = 170
const MIN_BOTTOM_ROW_HEIGHT_PX = 360
const MIN_STATUS_WIDTH_PX = 430
const MIN_ROSTER_WIDTH_PX = 300
const MIN_PLANNING_WIDTH_PX = 360
const MIN_CHART_WIDTH_PX = 520
const MIN_FOCUS_WIDTH_PX = 360

type DragTarget = 'page-row' | 'top-row' | 'bottom-left' | 'bottom-right'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clampSplit(value: number, totalSize: number, minPrimaryPx: number, minSecondaryPx: number): number {
  if (totalSize <= minPrimaryPx + minSecondaryPx) {
    return 0.5
  }

  const min = minPrimaryPx / totalSize
  const max = 1 - minSecondaryPx / totalSize
  return clamp(value, min, max)
}

export function HomePage() {
  const {
    gameState,
    selectedFactionId,
    playerIntent,
    forecast,
    selectFaction,
    setIntentValue,
    setIntentTarget,
    resetIntent,
    playNextSession,
    startCampaign,
    resetCampaign,
  } = useGameStore()
  const screenRef = useRef<HTMLElement | null>(null)
  const topRowRef = useRef<HTMLElement | null>(null)
  const bottomRowRef = useRef<HTMLElement | null>(null)
  const [pageRowSplit, setPageRowSplit] = useState(0.3)
  const [topRowSplit, setTopRowSplit] = useState(0.7)
  const [bottomLeftSplit, setBottomLeftSplit] = useState(0.28)
  const [bottomRightSplit, setBottomRightSplit] = useState(0.26)
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null)

  const playerFaction = gameState.factions.find((faction) => faction.isPlayer)
  const selectedFaction = gameState.factions.find((faction) => faction.id === selectedFactionId) ?? playerFaction

  useEffect(() => {
    if (!dragTarget) return

    const handlePointerMove = (event: PointerEvent) => {
      if (dragTarget === 'page-row') {
        const rect = screenRef.current?.getBoundingClientRect()
        if (!rect) return

        const next = (event.clientY - rect.top) / rect.height
        setPageRowSplit(clampSplit(next, rect.height, MIN_TOP_ROW_HEIGHT_PX, MIN_BOTTOM_ROW_HEIGHT_PX))
        return
      }

      if (dragTarget === 'top-row') {
        const rect = topRowRef.current?.getBoundingClientRect()
        if (!rect) return

        const next = (event.clientX - rect.left) / rect.width
        setTopRowSplit(clampSplit(next, rect.width, MIN_STATUS_WIDTH_PX, MIN_ROSTER_WIDTH_PX))
        return
      }

      const rect = bottomRowRef.current?.getBoundingClientRect()
      if (!rect) return

      if (dragTarget === 'bottom-left') {
        const next = (event.clientX - rect.left) / rect.width
        setBottomLeftSplit(clampSplit(next, rect.width, MIN_PLANNING_WIDTH_PX, MIN_CHART_WIDTH_PX + MIN_FOCUS_WIDTH_PX))
        return
      }

      const nextRight = (rect.right - event.clientX) / rect.width
      setBottomRightSplit(clampSplit(nextRight, rect.width, MIN_FOCUS_WIDTH_PX, MIN_PLANNING_WIDTH_PX + MIN_CHART_WIDTH_PX))
    }

    const handlePointerUp = () => {
      setDragTarget(null)
    }

    document.body.classList.add(
      'panel-resizing',
      dragTarget === 'page-row' ? 'panel-resizing-row' : 'panel-resizing-column',
    )
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      document.body.classList.remove('panel-resizing', 'panel-resizing-column', 'panel-resizing-row')
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [dragTarget])

  const startResize = (target: DragTarget) => {
    if (window.innerWidth <= DESKTOP_BREAKPOINT_PX) return
    setDragTarget(target)
  }

  const nudgePageRowSplit = (deltaPx: number) => {
    const rect = screenRef.current?.getBoundingClientRect()
    if (!rect) return

    setPageRowSplit((current) => clampSplit(current + deltaPx / rect.height, rect.height, MIN_TOP_ROW_HEIGHT_PX, MIN_BOTTOM_ROW_HEIGHT_PX))
  }

  const nudgeTopRowSplit = (deltaPx: number) => {
    const rect = topRowRef.current?.getBoundingClientRect()
    if (!rect) return

    setTopRowSplit((current) => clampSplit(current + deltaPx / rect.width, rect.width, MIN_STATUS_WIDTH_PX, MIN_ROSTER_WIDTH_PX))
  }

  const nudgeBottomLeftSplit = (deltaPx: number) => {
    const rect = bottomRowRef.current?.getBoundingClientRect()
    if (!rect) return

    setBottomLeftSplit((current) => clampSplit(current + deltaPx / rect.width, rect.width, MIN_PLANNING_WIDTH_PX, MIN_CHART_WIDTH_PX + MIN_FOCUS_WIDTH_PX))
  }

  const nudgeBottomRightSplit = (deltaPx: number) => {
    const rect = bottomRowRef.current?.getBoundingClientRect()
    if (!rect) return

    setBottomRightSplit((current) => clampSplit(current - deltaPx / rect.width, rect.width, MIN_FOCUS_WIDTH_PX, MIN_PLANNING_WIDTH_PX + MIN_CHART_WIDTH_PX))
  }

  const handlePageDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      nudgePageRowSplit(-24)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      nudgePageRowSplit(24)
    }
  }

  const handleTopDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudgeTopRowSplit(-24)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudgeTopRowSplit(24)
    }
  }

  const handleBottomLeftDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudgeBottomLeftSplit(-24)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudgeBottomLeftSplit(24)
    }
  }

  const handleBottomRightDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudgeBottomRightSplit(-24)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudgeBottomRightSplit(24)
    }
  }

  if (!playerFaction || !selectedFaction) {
    return <main className="shell">Unable to load faction state.</main>
  }

  return (
    <main
      className="game-screen"
      ref={screenRef}
      style={{ '--page-top-size': `${(pageRowSplit * 100).toFixed(2)}%` } as React.CSSProperties}
    >
      <section
        className="game-top-row"
        ref={topRowRef}
        style={{ '--top-left-size': `${(topRowSplit * 100).toFixed(2)}%` } as React.CSSProperties}
      >
        <CampaignStatusPanel
          gameState={gameState}
          selectedFaction={selectedFaction as Faction}
          onRunSession={playNextSession}
          onNewCampaign={() => startCampaign(Date.now())}
          onResetCampaign={resetCampaign}
        />

        <div
          aria-label="Resize status and faction list panels"
          aria-orientation="vertical"
          className={`panel-divider panel-divider-vertical ${dragTarget === 'top-row' ? 'panel-divider-active' : ''}`}
          onKeyDown={handleTopDividerKeyDown}
          onPointerDown={() => startResize('top-row')}
          role="separator"
          tabIndex={0}
        >
          <span className="panel-divider-handle" />
        </div>

        <FactionRosterPanel
          gameState={gameState}
          selectedFaction={selectedFaction as Faction}
          onSelectFaction={selectFaction}
        />
      </section>

      <div
        aria-label="Resize overview and tactical rows"
        aria-orientation="horizontal"
        className={`panel-divider panel-divider-horizontal ${dragTarget === 'page-row' ? 'panel-divider-active' : ''}`}
        onKeyDown={handlePageDividerKeyDown}
        onPointerDown={() => startResize('page-row')}
        role="separator"
        tabIndex={0}
      >
        <span className="panel-divider-handle" />
      </div>

      <section
        className="game-bottom-row"
        ref={bottomRowRef}
        style={{
          '--bottom-left-size': `${(bottomLeftSplit * 100).toFixed(2)}%`,
          '--bottom-right-size': `${(bottomRightSplit * 100).toFixed(2)}%`,
        } as React.CSSProperties}
      >
        <CommandPlanningPanel
          factions={gameState.factions}
          playerIntent={playerIntent}
          forecast={forecast}
          onSetIntentValue={setIntentValue}
          onSetIntentTarget={setIntentTarget}
          onResetIntent={resetIntent}
        />

        <div
          aria-label="Resize command vector and phase chart panels"
          aria-orientation="vertical"
          className={`panel-divider panel-divider-vertical ${dragTarget === 'bottom-left' ? 'panel-divider-active' : ''}`}
          onKeyDown={handleBottomLeftDividerKeyDown}
          onPointerDown={() => startResize('bottom-left')}
          role="separator"
          tabIndex={0}
        >
          <span className="panel-divider-handle" />
        </div>

        <section className="game-board-column">
          <PhaseSpaceChart
            factions={gameState.factions}
            selectedFactionId={selectedFaction.id}
            onSelectFaction={selectFaction}
          />
        </section>

        <div
          aria-label="Resize phase chart and faction focus panels"
          aria-orientation="vertical"
          className={`panel-divider panel-divider-vertical ${dragTarget === 'bottom-right' ? 'panel-divider-active' : ''}`}
          onKeyDown={handleBottomRightDividerKeyDown}
          onPointerDown={() => startResize('bottom-right')}
          role="separator"
          tabIndex={0}
        >
          <span className="panel-divider-handle" />
        </div>

        <FactionFocusPanel
          gameState={gameState}
          selectedFaction={selectedFaction as Faction}
        />
      </section>
    </main>
  )
}
