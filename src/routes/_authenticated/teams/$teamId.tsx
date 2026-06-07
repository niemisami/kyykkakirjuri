import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PlayerCreateInput } from '@/features/players/schemas'
import { initialPlayer, playerCreateSchema } from '@/features/players/schemas'
import { createPlayer, removePlayerFromTeam, updateTeam } from '@/features/teams/mutations'
import { teamQueryOptions } from '@/features/teams/queries'
import type { TeamCreateInput } from '@/features/teams/schemas'
import { teamCreateSchema } from '@/features/teams/schemas'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/teams/$teamId')({
  params: {
    parse: params => ({ teamId: z.coerce.number().parse(params.teamId) }),
    stringify: params => ({ teamId: String(params.teamId) }),
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(teamQueryOptions(params.teamId)),
  component: TeamDetailPage,
})

function TeamDetailPage() {
  const { teamId } = Route.useParams()
  const { data } = useSuspenseQuery(teamQueryOptions(teamId))
  const [editing, setEditing] = useState(false)
  const [addingPlayer, setAddingPlayer] = useState(false)
  const [playerToRemove, setPlayerToRemove] = useState<{ id: number, name: string } | null>(null)
  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: (playerId: number) => removePlayerFromTeam({ data: playerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      setPlayerToRemove(null)
    },
    meta: {
      successMessage: 'Pelaaja poistettu joukkueesta.',
      errorMessage: 'Poistaminen epäonnistui.',
    },
  })

  if(!data.team) {
    return <p className='p-8 text-center'>Joukkuetta ei löydy.</p>
  }

  const { team, players } = data
  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-4'>
        <Link to='/teams' className='text-sm text-blue-600 hover:underline'>
          ← Joukkueet
        </Link>
      </div>

      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>{team.name}</h1>
          {team.home && <p className='text-muted-foreground text-sm'>{team.home}</p>}
        </div>
        <Button variant='outline' onClick={() => setEditing(v => !v)}>
          {editing ? 'Peruuta' : 'Muokkaa'}
        </Button>
      </div>

      {editing
        ? (
          <div className='mb-8 rounded-lg border p-4'>
            <TeamEditForm
              teamId={teamId}
              defaultValues={{
                name: team.name,
                home: team.home ?? '',
                description: team.description ?? '',
                contactEmail: team.contactEmail ?? '',
              }}
              onSuccess={() => setEditing(false)}
            />
          </div>
        )
        : (
          <div className='mb-8 space-y-2 text-sm'>
            {team.description && <p>{team.description}</p>}
            {team.contactEmail && (
              <p>
                <span className='font-medium'>Yhteyssähköposti: </span>
                <a href={`mailto:${team.contactEmail}`} className='text-blue-600 hover:underline'>
                  {team.contactEmail}
                </a>
              </p>
            )}
          </div>
        )}

      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Pelaajat</h2>
        <Button variant='outline' size='sm' onClick={() => setAddingPlayer(v => !v)}>
          {addingPlayer ? 'Peruuta' : '+ Lisää pelaaja'}
        </Button>
      </div>

      {addingPlayer && (
        <div className='mb-4 rounded-lg border p-4'>
          <AddPlayerForm
            teamId={teamId}
            onSuccess={() => setAddingPlayer(false)}
          />
        </div>
      )}

      {players.length === 0
        ? (
          <p className='text-muted-foreground text-sm'>Ei pelaajia.</p>
        )
        : (
          <ul className='space-y-2'>
            {players.map(p => (
              <li key={p.id} className='flex items-center justify-between rounded-lg border px-4 py-3 text-sm'>
                <div>
                  <p className='font-medium'>{p.name}</p>
                  {p.email && <p className='text-muted-foreground'>{p.email}</p>}
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-destructive hover:text-destructive'
                  onClick={() => setPlayerToRemove({ id: p.id, name: p.name })}
                >
                  Poista
                </Button>
              </li>
            ))}
          </ul>
        )}

      <Dialog
        open={playerToRemove !== null}
        onOpenChange={(open) => {
          if(!open) setPlayerToRemove(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Poista pelaaja joukkueesta</DialogTitle>
            <DialogDescription>
              Poistetaanko <strong>{playerToRemove?.name}</strong> joukkueesta? Pelaajan tiedot säilyvät, mutta hänet poistetaan tämän joukkueen kokoonpanosta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPlayerToRemove(null)}>
              Peruuta
            </Button>
            <Button
              variant='destructive'
              disabled={removeMutation.isPending}
              onClick={() => playerToRemove && removeMutation.mutate(playerToRemove.id)}
            >
              {removeMutation.isPending ? 'Poistetaan…' : 'Poista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddPlayerForm({
  teamId,
  onSuccess,
}: {
  teamId: number | null
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (data: PlayerCreateInput) => createPlayer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      onSuccess()
    },
    meta: {
      successMessage: 'Pelaaja lisätty!',
      errorMessage: 'Lisääminen epäonnistui.',
    },
  })

  const defaultValues: PlayerCreateInput = { ...initialPlayer, teamId }
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await addMutation.mutateAsync(value)
    },
    validators: {
      onSubmit: playerCreateSchema,
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className='space-y-3'
    >
      <h3 className='font-medium text-sm'>Uusi pelaaja</h3>

      <form.Field name='name'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Nimi <span className='text-red-500'>*</span>
            </label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Pelaajan nimi'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className='mt-1 text-xs text-red-500'>{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name='email'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>Sähköposti</label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='pelaaja@example.com'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className='mt-1 text-xs text-red-500'>{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={s => s.isSubmitting}>
        {isSubmitting => (
          <Button type='submit' size='sm' disabled={isSubmitting}>
            {isSubmitting ? 'Lisätään…' : 'Lisää pelaaja'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

function TeamEditForm({
  teamId,
  defaultValues,
  onSuccess,
}: {
  teamId: number
  defaultValues: TeamCreateInput
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (data: TeamCreateInput) => updateTeam({ data: { ...data, id: teamId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      onSuccess()
    },
    meta: {
      successMessage: 'Tiedot tallennettu!',
      errorMessage: 'Tallentaminen epäonnistui.',
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const parsed = teamCreateSchema.parse(value)
      await updateMutation.mutateAsync(parsed)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className='space-y-4'
    >
      <form.Field name='name'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Nimi <span className='text-red-500'>*</span>
            </label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className='mt-1 text-xs text-red-500'>
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name='home'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>Kotipaikka</label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field name='description'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>Kuvaus</label>
            <textarea
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows={3}
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field name='contactEmail'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>Yhteyssähköposti</label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className='mt-1 text-xs text-red-500'>
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={s => s.isSubmitting}>
        {isSubmitting => (
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Tallennetaan…' : 'Tallenna muutokset'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
