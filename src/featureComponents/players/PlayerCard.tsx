import NavCard from '@/components/NavCard'
import type { ComponentProps } from 'react'
import PlayerItem from './details/Item'

type Props = ComponentProps<typeof PlayerItem>

const PlayerCard = ({ player, team }: Props) => {
  return (
    <NavCard
      to='/players/$playerId'
      params={{ playerId: player.id }}
      viewTransition
    >
      <PlayerItem player={player} team={team} />
    </NavCard>
  )
}

export default PlayerCard
