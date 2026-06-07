import NavCard from '@/components/NavCard'
import type { Team } from '@/features/teams/schemas'
import TeamItem from './details/Item'

type Props = {
  team: Team
}

const TeamCard = ({ team }: Props) => {
  return (
    <NavCard
      to='/teams/$teamId'
      params={{ teamId: team.id }}
      viewTransition
    >
      <TeamItem team={team} />
    </NavCard>
  )
}

export default TeamCard
