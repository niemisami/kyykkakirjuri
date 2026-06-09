import { CheckCircle, Clock } from 'lucide-react'

import TeamSection from '@/featureComponents/games/details/TeamSection'
import { gameQueryOptions } from '@/features/games/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/games/$gameId')({
  params: {
    parse: params => ({ gameId: z.coerce.number().parse(params.gameId) }),
    stringify: params => ({ gameId: String(params.gameId) }),
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(gameQueryOptions(params.gameId)),
  component: GameDetailPage,
  wrapInSuspense: true,
})

function GameDetailPage() {
  const { gameId } = Route.useParams()
  const { data } = useSuspenseQuery(gameQueryOptions(gameId))

  if(!data) {
    return <p className='p-8 text-center'>Peliä ei löydy.</p>
  }

  const { game, teams } = data
  const isFinished = game.endedAt != null

  const startDate = new Date(game.startedAt).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-4'>
        <Link to='/games' className='text-sm text-blue-600 hover:underline'>
          ← Pelit
        </Link>
      </div>

      <div className='mb-6'>
        <div className='flex items-center gap-2'>
          {isFinished
            ? <CheckCircle className='size-5 text-green-600' />
            : <Clock className='size-5 text-yellow-500' />}
          <h1 className='text-2xl font-bold'>Peli {startDate}</h1>
        </div>
        <p className='mt-1 text-sm text-muted-foreground'>
          {isFinished
            ? `Päättynyt ${new Date(game.endedAt!).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
            : 'Käynnissä'}
        </p>
      </div>

      {teams.length === 0
        ? (
          <p className='text-sm text-muted-foreground'>Ei joukkueita tässä pelissä.</p>
        )
        : (
          <div className='space-y-4'>
            {teams.map(team => (
              <TeamSection
                key={team.id}
                name={team.name}
                totalScore={team.totalScore}
                players={team.players}
              />
            ))}
          </div>
        )}
    </div>
  )
}
