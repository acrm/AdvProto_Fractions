import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../application/useGameStore'
import { Faction } from '../../domain/gameModel'
import { CommandPlanningPanel } from '../components/CommandPlanningPanel'
import { GameControlPanel } from '../components/GameControlPanel'
import { PhaseSpaceChart } from '../components/PhaseSpaceChart'

const DESKTOP_BREAKPOINT_PX = 1180
const MIN_TACTICAL_WIDTH_PX = 520
const MIN_SIDEBAR_WIDTH_PX = 360
const MIN_CHART_HEIGHT_PX = 280
const MIN_PLANNING_HEIGHT_PX = 240

type DragTarget = 'screen' | 'tactical'

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
    lastOutcome,
    selectFaction,
    setIntentValue,
    setIntentTarget,
    resetIntent,
    playNextSession,
    startCampaign,
    resetCampaign,
  } = useGameStore()
  const screenRef = useRef<HTMLElement | null>(null)
  const tacticalRef = useRef<HTMLElement | null>(null)
  const [screenSplit, setScreenSplit] = useState(0.6)
  const [tacticalSplit, setTacticalSplit] = useState(0.62)
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null)

  const playerFaction = gameState.factions.find((faction) => faction.isPlayer)
  const selectedFaction = gameState.factions.find((faction) => faction.id === selectedFactionId) ?? playerFaction

  useEffect(() => {
    if (!dragTarget) return

    const handlePointerMove = (event: PointerEvent) => {
      if (dragTarget === 'screen') {
        const rect = screenRef.current?.getBoundingClientRect()
        if (!rect) return

        const next = (event.clientX - rect.left) / rect.width
        setScreenSplit(clampSplit(next, rect.width, MIN_TACTICAL_WIDTH_PX, MIN_SIDEBAR_WIDTH_PX))
        return
      }

      const rect = tacticalRef.current?.getBoundingClientRect()
      if (!rect) return

      const next = (event.clientY - rect.top) / rect.height
      setTacticalSplit(clampSplit(next, rect.height, MIN_CHART_HEIGHT_PX, MIN_PLANNING_HEIGHT_PX))
    }

    const handlePointerUp = () => {
      setDragTarget(null)
    }

    document.body.classList.add('panel-resizing', dragTarget === 'screen' ? 'panel-resizing-column' : 'panel-resizing-row')
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

  const nudgeScreenSplit = (deltaPx: number) => {
    const rect = screenRef.current?.getBoundingClientRect()
    if (!rect) return

    setScreenSplit((current) => clampSplit(current + deltaPx / rect.width, rect.width, MIN_TACTICAL_WIDTH_PX, MIN_SIDEBAR_WIDTH_PX))
  }

  const nudgeTacticalSplit = (deltaPx: number) => {
    const rect = tacticalRef.current?.getBoundingClientRect()
    if (!rect) return

    setTacticalSplit((current) => clampSplit(current + deltaPx / rect.height, rect.height, MIN_CHART_HEIGHT_PX, MIN_PLANNING_HEIGHT_PX))
  }

  const handleScreenDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudgeScreenSplit(-24)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudgeScreenSplit(24)
    }
  }

  const handleTacticalDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      nudgeTacticalSplit(-24)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      nudgeTacticalSplit(24)
    }
  }

  if (!playerFaction || !selectedFaction) {
    return <main className="shell">Unable to load faction state.</main>
  }

  return (
    <main
      className="game-screen"
      ref={screenRef}
      style={{ '--screen-left-size': `${(screenSplit * 100).toFixed(2)}%` } as React.CSSProperties}
    >
      <section
        className="game-tactical-column"
        ref={tacticalRef}
        style={{ '--tactical-top-size': `${(tacticalSplit * 100).toFixed(2)}%` } as React.CSSProperties}
      >
        <section className="game-board-column">
          <PhaseSpaceChart
            factions={gameState.factions}
            selectedFactionId={selectedFaction.id}
            onSelectFaction={selectFaction}
          />
        </section>

        <div
          aria-label="Resize chart and planning panels"
          aria-orientation="horizontal"
          className={`panel-divider panel-divider-horizontal ${dragTarget === 'tactical' ? 'panel-divider-active' : ''}`}
          onKeyDown={handleTacticalDividerKeyDown}
          onPointerDown={() => startResize('tactical')}
          role="separator"
          tabIndex={0}
        >
          <span className="panel-divider-handle" />
        </div>

        <CommandPlanningPanel
          factions={gameState.factions}
          playerIntent={playerIntent}
          forecast={forecast}
          lastOutcome={lastOutcome}
          onSetIntentValue={setIntentValue}
          onSetIntentTarget={setIntentTarget}
          onResetIntent={resetIntent}
        />
      </section>

      <div
        aria-label="Resize tactical and intelligence panels"
        aria-orientation="vertical"
        className={`panel-divider panel-divider-vertical ${dragTarget === 'screen' ? 'panel-divider-active' : ''}`}
        onKeyDown={handleScreenDividerKeyDown}
        onPointerDown={() => startResize('screen')}
        role="separator"
        tabIndex={0}
      >
        <span className="panel-divider-handle" />
      </div>

      <GameControlPanel
        gameState={gameState}
        selectedFaction={selectedFaction as Faction}
        onSelectFaction={selectFaction}
        onRunSession={playNextSession}
        onNewCampaign={() => startCampaign(Date.now())}
        onResetCampaign={resetCampaign}
      />
    </main>
  )
}
