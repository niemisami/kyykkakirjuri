import NavCard from '@/components/NavCard'
import { playersQueryOptions } from '@/features/player/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/players/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(playersQueryOptions),
  component: PlayersPage,
})

function PlayersPage() {
  const { data: players } = useSuspenseQuery(playersQueryOptions)

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Pelaajat</h1>

      {players.length === 0
        ? (
          <p className='text-muted-foreground text-sm'>Ei pelaajia vielä.</p>
        )
        : (
          <ul className='space-y-2'>
            {players.map(player => (
              <li key={player.id}>
                <NavCard to='/players/$playerId' params={{ playerId: player.id }} title={player.name} description={player.email ?? ''} />
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
