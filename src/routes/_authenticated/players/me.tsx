import { Button } from '@/components/ui/button'
import { PlayerForm } from '@/features/player/PlayerForm'
import { createMyPlayer, updateMyPlayer } from '@/features/player/mutations'
import { myPlayerQueryOptions } from '@/features/player/queries'
import type { Player } from '@/features/player/queries'
import type { PlayerCreateInput, PlayerUpdateInput } from '@/features/player/schemas'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/players/me')({
  loader: ({ context }) => context.queryClient.ensureQueryData(myPlayerQueryOptions),
  component: MyPlayerPage,
})

function MyPlayerPage() {
  const { user } = Route.useRouteContext()
  const { data: myPlayer } = useSuspenseQuery(myPlayerQueryOptions)

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Pelaajatili</h1>
      {myPlayer
        ? <EditMyPlayerCard player={myPlayer} />
        : <CreatePlayerCard defaultValues={user} />}
    </div>
  )
}

function CreatePlayerCard({
  defaultValues,
}: {
  defaultValues: PlayerCreateInput
}) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: PlayerCreateInput) => createMyPlayer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', 'me'] })
    },
    meta: {
      successMessage: 'Pelaajatili luotu!',
      errorMessage: 'Luonti epäonnistui.',
    },
  })

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-3'>
        <h2 className='text-base font-semibold'>Luo pelaajatili</h2>
        <p className='text-muted-foreground text-sm'>
          Luo oma pelaajaprofiilisi liittyäksesi joukkueisiin ja peleihin.
        </p>
      </div>
      <PlayerForm
        defaultValues={defaultValues}
        submitLabel='Luo pelaajatili'
        onSubmit={async (value) => {
          await createMutation.mutateAsync(value)
        }}
      />
    </div>
  )
}

function EditMyPlayerCard({
  player,
}: {
  player: Player
}) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (data: PlayerUpdateInput) => updateMyPlayer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', 'me'] })
      setEditing(false)
    },
    meta: {
      successMessage: 'Pelaajatiedot päivitetty!',
      errorMessage: 'Päivitys epäonnistui.',
    },
  })

  if(!editing) {
    return (
      <div className='rounded-lg border px-4 py-3 text-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium'>{player.name}</p>
            {player.email && (
              <p className='text-muted-foreground'>{player.email}</p>
            )}
          </div>
          <Button variant='outline' size='sm' onClick={() => setEditing(true)}>
            Muokkaa
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-3 flex items-start justify-between'>
        <h2 className='text-base font-semibold'>Muokkaa pelaajatietoja</h2>
        <button
          type='button'
          onClick={() => setEditing(false)}
          className='text-muted-foreground hover:text-foreground text-sm'
        >
          Peruuta
        </button>
      </div>
      <PlayerForm
        player={player}
        defaultValues={player}
        submitLabel='Tallenna'
        onSubmit={async (value) => {
          await updateMutation.mutateAsync({ ...value, id: player.id })
        }}
      />
    </div>
  )
}
