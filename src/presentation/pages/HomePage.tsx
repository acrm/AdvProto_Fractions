import { useGameStore } from '../../application/useGameStore'
import { Faction } from '../../domain/gameModel'
import { GameControlPanel } from '../components/GameControlPanel'
import { PhaseSpaceChart } from '../components/PhaseSpaceChart'

export function HomePage() {
  const {
    gameState,
    selectedFactionId,
    playerIntent,
    forecast,
    lastOutcome,
    selectFaction,
    setIntentValue,
    resetIntent,
    playNextSession,
    startCampaign,
    resetCampaign,
  } = useGameStore()

  const playerFaction = gameState.factions.find((faction) => faction.isPlayer)
  const selectedFaction = gameState.factions.find((faction) => faction.id === selectedFactionId) ?? playerFaction

  if (!playerFaction || !selectedFaction) {
    return <main className="shell">Unable to load faction state.</main>
  }

  return (
    <main className="game-screen">
      <section className="game-board-column">
        <PhaseSpaceChart
          factions={gameState.factions}
          selectedFactionId={selectedFaction.id}
          onSelectFaction={selectFaction}
        />
      </section>

      <GameControlPanel
        gameState={gameState}
        playerFaction={playerFaction}
        selectedFaction={selectedFaction as Faction}
        playerIntent={playerIntent}
        forecast={forecast}
        lastOutcome={lastOutcome}
        onSetIntentValue={setIntentValue}
        onResetIntent={resetIntent}
        onRunSession={playNextSession}
        onNewCampaign={() => startCampaign(Date.now())}
        onResetCampaign={resetCampaign}
      />
    </main>
  )
}
