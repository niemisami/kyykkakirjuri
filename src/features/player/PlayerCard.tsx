import NavCard from '@/components/NavCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Shield } from 'lucide-react'
import type { Player } from './schemas'
import type { Team } from '../teams/schemas'

type Props = {
  player: Player
  team: Team | null
}

const PlayerCard = ({ player, team }: Props) => {
  return (
    <NavCard
      to='/players/$playerId'
      params={{ playerId: player.id }}
      viewTransition
      title={(
        <div className='flex items-center gap-2'>
          <Avatar size='sm' style={{ viewTransitionName: `player-avatar-${player.id}` }}>
            <AvatarImage src={player.user?.image ?? undefined} alt={player.name} />
            <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className='font-medium' style={{ viewTransitionName: `player-name-${player.id}` }}>
            {player.name}
          </p>
        </div>
      )}
      description={(
        <NavCard.DescriptionTitle className='flex items-center gap-2'>
          <Mail className='size-3 stroke-3 text-shadow-fuchsia-950' /> {player.email || '-'}
          <Shield className='size-3 stroke-3 text-shadow-fuchsia-950' /> {team?.name || '-'}
        </NavCard.DescriptionTitle>
      )}
    />
  )
}

export default PlayerCard
