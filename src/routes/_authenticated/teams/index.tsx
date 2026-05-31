import { buttonVariants } from '@/components/ui/button'
import { teamsQueryOptions } from '@/features/teams/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/teams/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(teamsQueryOptions),
  component: TeamsPage,
})

function TeamsPage() {
  const { data: teams } = useSuspenseQuery(teamsQueryOptions)

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
          <ul className='space-y-2'>
            {teams.map(team => (
              <li key={team.id}>
                <Link
                  to='/teams/$teamId'
                  params={{ teamId: team.id }}
                  className='block rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                >
                  <p className='font-medium'>{team.name}</p>
                  {team.home && (
                    <p className='text-muted-foreground text-sm'>{team.home}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
