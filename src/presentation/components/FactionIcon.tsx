import {
  faBoxesStacked,
  faCoins,
  faCompassDrafting,
  faCrosshairs,
  faFireFlameCurved,
  faHandshake,
  faLandmark,
  faLightbulb,
  faShieldHalved,
  faTowerBroadcast,
  faUserSecret,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { ActivityVectorName } from '../../domain/gameModel'

const FACTION_ICONS: Record<string, IconDefinition> = {
  landmark: faLandmark,
  fire: faFireFlameCurved,
  coins: faCoins,
  'drafting-compass': faCompassDrafting,
  shield: faShieldHalved,
  lightbulb: faLightbulb,
}

export const VECTOR_ICONS: Record<ActivityVectorName, IconDefinition> = {
  territorialPressure: faCrosshairs,
  diplomaticMomentum: faHandshake,
  economicThroughput: faBoxesStacked,
  covertTempo: faUserSecret,
  deterrencePosture: faTowerBroadcast,
}

interface FactionIconProps {
  name: string
  className?: string
}

export function FactionIcon({ name, className }: FactionIconProps) {
  return <FontAwesomeIcon icon={FACTION_ICONS[name] ?? faLightbulb} fixedWidth className={className} />
}