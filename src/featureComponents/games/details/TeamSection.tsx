import { User } from 'lucide-react'

import { Item, ItemContent, ItemGroup, ItemMedia } from '@/components/ui/item'
import Description from '@/components/typography/Description'
import Title from '@/components/typography/Title'
import type { PlayerStats } from '@/features/games/schemas'
import { pluralize } from '@/lib/utils'

type Props = {
  player: PlayerStats
}

const PlayerRow = ({ player }: Props) => {
  return (
    <Item variant='muted' size='sm'>
      <ItemMedia>
        <User className='size-8 rounded-lg bg-muted p-1.5' />
      </ItemMedia>
      <ItemContent>
        <Title>{player.name}</Title>
        <Description>{pluralize(player.totalKnockedOut, 'poisto', 'poistoa')}</Description>
      </ItemContent>
    </Item>
  )
}

type TeamSectionProps = {
  name: string
  totalScore: number
  players: PlayerStats[]
}

const TeamSection = ({ name, totalScore, players }: TeamSectionProps) => {
  return (
    <div className='rounded-xl border p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-base font-semibold'>{name}</h3>
        <span className='text-sm font-medium text-muted-foreground'>
          Yhteensä: <span className='text-foreground font-bold'>{totalScore}</span>
        </span>
      </div>
      {players.length === 0
        ? (
          <p className='text-sm text-muted-foreground'>Ei pelaajia.</p>
        )
        : (
          <ItemGroup>
            {players.map(player => (
              <PlayerRow key={player.playerId} player={player} />
            ))}
          </ItemGroup>
        )}
    </div>
  )
}

export default TeamSection
