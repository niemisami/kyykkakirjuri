import { buttonVariants } from '@/components/ui/button'
import { ItemGroup } from '@/components/ui/item'
import TeamCard from '@/featureComponents/teams/TeamCard'
import { teamsQueryOptions } from '@/features/teams/queries'
import type { Team } from '@/features/teams/schemas'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/teams/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(teamsQueryOptions()),
  component: TeamsPage,
  wrapInSuspense: true,
})

function TeamList({ teams }: { teams: Team[] }) {
  return (
    <ItemGroup>
      {teams.map(team => (
        <TeamCard key={team.id} team={team} />
      ))}
    </ItemGroup>
  )
}

function TeamsPage() {
  const { data: teams } = useSuspenseQuery(teamsQueryOptions())

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Joukkueet</h1>
        <Link
          to='/teams/new'
          className={buttonVariants({})}
        >
          Lisää joukkue
        </Link>
      </div>

      {teams.length === 0
        ? (
          <p className='text-muted-foreground text-sm'>Ei joukkueita vielä.</p>
        )
        : (
          <TeamList teams={teams} />
        )}
    </div>
  )
}
