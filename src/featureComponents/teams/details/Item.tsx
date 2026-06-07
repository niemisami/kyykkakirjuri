import { MapPin, Users } from 'lucide-react'

import Description from '@/components/typography/Description'
import Title from '@/components/typography/Title'
import {
  ItemContent,
  ItemMedia,
} from '@/components/ui/item'
import type { Team } from '@/features/teams/schemas'

type Props = {
  team: Team
}

const TeamItem = ({ team }: Props) => {
  return (
    <>
      <ItemMedia>
        <Users className='size-10 rounded-xl bg-muted p-2.5' />
      </ItemMedia>
      <ItemContent>
        <Title>{team.name}</Title>
        {team.home && (
          <Description className='flex items-center gap-2'>
            <MapPin className='size-3 stroke-3' /> {team.home}
          </Description>
        )}
      </ItemContent>
    </>
  )
}

export default TeamItem
