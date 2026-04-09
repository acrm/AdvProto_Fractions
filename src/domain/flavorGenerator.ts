import { createSeededRandom } from '../infrastructure/seededRandom'
import { Faction, IntelItem, Objective, PlayerStrategy, SessionOutcome } from './gameModel'
import { FACTION_SEEDS, NARRATIVE_CONTACTS, NARRATIVE_LOCATIONS, NORS_GATE_OVERVIEW, OBJECTIVE_VERBS, PRIORITY_DESCRIPTORS } from './narrativeData'

function pickLocation(seed: number) {
  const rng = createSeededRandom(seed)
  return NARRATIVE_LOCATIONS[rng.nextInt(0, NARRATIVE_LOCATIONS.length - 1)]
}

function pickContact(seed: number, sphere?: string) {
  const rng = createSeededRandom(seed)
  const pool = sphere ? NARRATIVE_CONTACTS.filter((contact) => contact.sphere === sphere) : NARRATIVE_CONTACTS
  const safePool = pool.length > 0 ? pool : NARRATIVE_CONTACTS
  return safePool[rng.nextInt(0, safePool.length - 1)]
}

export function getFactionSeed(index: number) {
  return FACTION_SEEDS[index % FACTION_SEEDS.length]
}

export function createSeasonBriefing(seasonNumber: number, factions: Faction[], seed: number): string {
  const leadFaction = factions[seed % factions.length]
  const location = pickLocation(seed + seasonNumber * 19)
  return `Season ${seasonNumber} opens in ${NORS_GATE_OVERVIEW.city}: ${leadFaction.name} presses ${location.name}, while every power watches the gate for weakness.`
}

export function createObjectiveFlavor(objective: Objective, faction: Faction, seed: number): Pick<Objective, 'title' | 'summary' | 'locationName'> {
  const rng = createSeededRandom(seed)
  const location = pickLocation(seed + 7)
  const verbPool = OBJECTIVE_VERBS[objective.type]
  const verb = verbPool[rng.nextInt(0, verbPool.length - 1)]
  const contact = pickContact(seed + 13, faction.profile.sphere)
  const title = `${verb[0].toUpperCase()}${verb.slice(1)} ${location.name}`
  const summary = `${PRIORITY_DESCRIPTORS[objective.priority]} for ${faction.name}: ${contact.title} ${contact.name} expects this move to ${verb} leverage around ${location.name}.`
  return {
    title,
    summary,
    locationName: location.name,
  }
}

export function createIntelFlavor(intel: IntelItem, target: Faction, seed: number): Pick<IntelItem, 'message' | 'sourceName' | 'locationName'> {
  const location = pickLocation(seed + 29)
  const contact = pickContact(seed + 41)
  const prefix = intel.isDeceptive ? 'Rumor from a compromised source' : `Report from ${contact.title} ${contact.name}`
  const message = intel.isDeceptive
    ? `${prefix}: ${target.name} is said to be yielding ground near ${location.name}, but the tale smells of bait.`
    : `${prefix}: ${target.name} is shifting crews toward ${location.name} for a fresh push next session.`

  return {
    message,
    sourceName: `${contact.title} ${contact.name}`,
    locationName: location.name,
  }
}

export function createSessionNarrative(outcome: SessionOutcome, playerFaction: Faction, strategy: PlayerStrategy, seed: number): string {
  const location = pickLocation(seed + 53)
  const strategyLine =
    strategy === 'progress'
      ? 'the guild pressed its luck in the open'
      : strategy === 'sabotage'
        ? 'the guild worked by knife-light and rumor'
        : 'the guild split its hand between gain and disruption'

  return `${playerFaction.name} moved through ${location.name}; ${strategyLine}, earning ${outcome.progressedObjectives} forward gains and spoiling ${outcome.sabotagedObjectives} rival plays.`
}