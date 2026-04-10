import { FactionProfile, FactionSphere, ObjectiveType, ObjectivePriority } from './gameModel'

export interface NarrativeLocation {
  name: string
  tag: string
  description: string
}

export interface NarrativeContact {
  name: string
  title: string
  sphere: FactionSphere
}

export interface NarrativeFactionSeed {
  name: string
  icon: string
  profile: FactionProfile
}

export const NORS_GATE_OVERVIEW = {
  city: 'North Gate',
  premise:
    'The only open gate into the under-country stands beneath North Gate, a hard frontier city where councils, temples, cartels, scholars, and mercenary banners compete to civilize and exploit a continent-sized dungeon.',
}

export const NARRATIVE_LOCATIONS: NarrativeLocation[] = [
  {
    name: 'North Gate',
    tag: 'city',
    description: 'A smoke-choked boom city pressed around the only open descent into the under-country.',
  },
  {
    name: 'The Gate Market',
    tag: 'trade',
    description: 'Auction floors, charter offices, and black tents where every expedition is bought twice.',
  },
  {
    name: 'Pilgrim Wells',
    tag: 'faith',
    description: 'A shrine-ringed aquifer where miracles and poison draw equal crowds.',
  },
  {
    name: 'Saltglass Veins',
    tag: 'resource',
    description: 'Glittering tunnels rich in alchemical crystal, contested by miners and smugglers alike.',
  },
  {
    name: 'The Switchback Frontier',
    tag: 'frontier',
    description: 'A ladder of old fort-tracks and fresh graves marking the newest line of expansion.',
  },
  {
    name: 'The Hollow Archive',
    tag: 'science',
    description: 'An impossible ruin of sealed vaults, maps, and pre-cataclysmic instruments.',
  },
]

export const NARRATIVE_CONTACTS: NarrativeContact[] = [
  { name: 'Magistrate Elira Voss', title: 'Charter Marshal', sphere: 'political' },
  { name: 'Prelate Amon Kest', title: 'Keeper of Ember Tithes', sphere: 'religious' },
  { name: 'Silas Rook', title: 'Broker of Claims', sphere: 'economic' },
  { name: 'Professor Talandra Mire', title: 'Chief Surveyor', sphere: 'scientific' },
  { name: 'Marshal Corven Draik', title: 'Banner Commander', sphere: 'military' },
  { name: 'Mara Flint', title: 'Guild Factor', sphere: 'guild' },
]

export const FACTION_SEEDS: NarrativeFactionSeed[] = [
  {
    name: 'North Gate Compact',
    icon: 'landmark',
    profile: {
      sphere: 'political',
      leaderName: 'Magistrate Elira Voss',
      doctrine: 'Rule the gate, license the frontier, tax every victory.',
      methods: 'charters, councils, sheriffs, and selective legitimacy',
      homeBase: 'North Gate Council Quarter',
      agenda: 'Turn the under-country into a governable colonial dominion.',
    },
  },
  {
    name: 'Ember Reliquary',
    icon: 'fire',
    profile: {
      sphere: 'religious',
      leaderName: 'Prelate Amon Kest',
      doctrine: 'Sanctify the descent and claim every relic before heresy does.',
      methods: 'pilgrim processions, confession networks, and holy censures',
      homeBase: 'Pilgrim Wells',
      agenda: 'Bind the deep frontier to sacred authority and miracle monopolies.',
    },
  },
  {
    name: 'Gilded Ledger Exchange',
    icon: 'coins',
    profile: {
      sphere: 'economic',
      leaderName: 'Silas Rook',
      doctrine: 'If it can be hauled, insured, or auctioned, it belongs on the books.',
      methods: 'caravan finance, claim speculation, and hired smugglers',
      homeBase: 'The Gate Market',
      agenda: 'Own the supply lines and debt-chains of every frontier venture.',
    },
  },
  {
    name: 'Argent Survey Collegium',
    icon: 'drafting-compass',
    profile: {
      sphere: 'scientific',
      leaderName: 'Professor Talandra Mire',
      doctrine: 'Map first, classify second, exploit only when the notes are complete.',
      methods: 'survey teams, field laboratories, specimen contracts, and sealed reports',
      homeBase: 'The Hollow Archive Annex',
      agenda: 'Control knowledge of the under-country before the other powers weaponize it.',
    },
  },
  {
    name: 'Iron Banner Companies',
    icon: 'shield',
    profile: {
      sphere: 'military',
      leaderName: 'Marshal Corven Draik',
      doctrine: 'Hold the road, fort the shaft, answer fear with iron.',
      methods: 'forts, escorts, reprisals, and paid discipline',
      homeBase: 'The Switchback Frontier',
      agenda: 'Make the dungeon safe enough to conquer and dangerous enough to stay necessary.',
    },
  },
  {
    name: 'Grey Lantern Guild',
    icon: 'lightbulb',
    profile: {
      sphere: 'guild',
      leaderName: 'Mara Flint',
      doctrine: 'Stay small, move fast, and sell leverage before anyone can own you.',
      methods: 'free contracts, deniable crews, fixers, and scavenged favor',
      homeBase: 'Grey Lantern Hall',
      agenda: 'Survive between empires and seize a permanent stake in the frontier.',
    },
  },
]

export const OBJECTIVE_VERBS: Record<ObjectiveType, string[]> = {
  influence: ['lean on', 'outmaneuver', 'coerce', 'court'],
  control: ['fortify', 'claim', 'hold', 'seal'],
  resource: ['extract', 'secure', 'divert', 'corner'],
  elimination: ['break', 'remove', 'silence', 'ruin'],
  positioning: ['stage', 'prepare', 'anchor', 'position'],
}

export const PRIORITY_DESCRIPTORS: Record<ObjectivePriority, string> = {
  critical: 'a season-defining move',
  high: 'a decisive push',
  medium: 'a useful opening',
  low: 'a probing play',
}