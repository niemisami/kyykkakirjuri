import { PlayerForm } from '@/features/player/PlayerForm'
import { updatePlayer } from '@/features/player/mutations'
import { playerQueryOptions } from '@/features/player/queries'
import type { PlayerUpdateInput } from '@/features/player/schemas'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/players/$playerId')({
  params: {
    parse: params => ({ playerId: z.coerce.number().parse(params.playerId) }),
    stringify: params => ({ playerId: String(params.playerId) }),
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
  component: PlayerDetailPage,
})

function PlayerDetailPage() {
  const { playerId } = Route.useParams()
  const { data: player } = useSuspenseQuery(playerQueryOptions(playerId))
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (data: PlayerUpdateInput) => updatePlayer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] })
    },
    meta: {
      successMessage: 'Pelaajatiedot päivitetty!',
      errorMessage: 'Päivitys epäonnistui.',
    },
  })
  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-4'>
        <Link to='/app' className='text-sm text-blue-600 hover:underline'>
          ← Etusivu
        </Link>
      </div>

      <h1 className='mb-6 text-2xl font-bold'>Pelaaja</h1>
      {player
        ? (
          <PlayerForm
            defaultValues={player}
            submitLabel='Tallenna'
            onSubmit={async (value) => {
              await updateMutation.mutateAsync({ ...value, id: playerId })
            }}
          />
        )
        : <p className='text-center'>Pelaajaa ei löydy.</p>}
    </div>
  )
}
