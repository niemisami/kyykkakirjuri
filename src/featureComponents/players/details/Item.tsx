import { Mail, Shield } from 'lucide-react'

import Description from '@/components/typography/Description'
import Title from '@/components/typography/Title'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  ItemActions,
  ItemContent,
  ItemMedia,
} from '@/components/ui/item'
import type { Player } from '@/features/players/schemas'
import type { Team } from '@/features/teams/schemas'

type Props = {
  player: Player
  team: Team | null
  actions?: React.ReactNode
}

function PlayerItem({ player, team, actions }: Props) {
  return (
    <>
      <ItemMedia>
        <Avatar className='size-10' style={{ viewTransitionName: `player-avatar-${player.id}` }}>
          <AvatarImage src={player.user?.image ?? undefined} alt={player.name} />
          <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <Title style={{ viewTransitionName: `player-name-${player.id}` }}>{player.name}</Title>
        <Description className='flex items-center gap-2'>
          <Mail className='size-3 stroke-3 text-shadow-fuchsia-950' /> {player.email || '-'}
          <Shield className='size-3 stroke-3 text-shadow-fuchsia-950' /> {team?.name || '-'}
        </Description>
      </ItemContent>
      {actions && (
        <ItemActions>
          {actions}
        </ItemActions>
      )}
    </>
  )
}

export default PlayerItem
