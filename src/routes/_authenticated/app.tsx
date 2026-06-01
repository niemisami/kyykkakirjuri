import { Button } from '@/components/ui/button'
import { createMyPlayer } from '@/features/player/mutations'
import { myPlayerQueryOptions } from '@/features/player/queries'
import type { CreateMyPlayerInput } from '@/features/player/schemas'
import { createMyPlayerSchema } from '@/features/player/schemas'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/app')({
  loader: ({ context }) => context.queryClient.ensureQueryData(myPlayerQueryOptions),
  component: AppPage,
})

function AppPage() {
  const { user } = Route.useRouteContext()
  const { data: myPlayer } = useSuspenseQuery(myPlayerQueryOptions)
  const [dismissed, setDismissed] = useState(false)

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Etusivu</h1>

      {!myPlayer && !dismissed && (
        <CreatePlayerBanner
          defaultName={user.name}
          defaultEmail={user.email}
          onDismiss={() => setDismissed(true)}
        />
      )}

      {myPlayer && (
        <div className='rounded-lg border px-4 py-3 text-sm'>
          <p className='font-medium'>{myPlayer.name}</p>
          {myPlayer.email && (
            <p className='text-muted-foreground'>{myPlayer.email}</p>
          )}
        </div>
      )}
    </div>
  )
}

function CreatePlayerBanner({
  defaultName,
  defaultEmail,
  onDismiss,
}: {
  defaultName: string
  defaultEmail: string
  onDismiss: () => void
}) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateMyPlayerInput) => createMyPlayer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', 'me'] })
    },
    meta: {
      successMessage: 'Pelaajatili luotu!',
      errorMessage: 'Luonti epäonnistui.',
    },
  })

  const form = useForm({
    defaultValues: { name: defaultName, email: defaultEmail },
    onSubmit: async ({ value }) => {
      const parsed = createMyPlayerSchema.parse(value)
      await createMutation.mutateAsync(parsed)
    },
  })

  return (
    <div className='mb-6 rounded-lg border p-4'>
      <div className='mb-3 flex items-start justify-between'>
        <div>
          <h2 className='text-base font-semibold'>Luo pelaajatili</h2>
          <p className='text-muted-foreground text-sm'>
            Luo oma pelaajaprofiilisi liittyäksesi joukkueisiin ja peleihin.
          </p>
        </div>
        <button
          type='button'
          onClick={onDismiss}
          className='text-muted-foreground hover:text-foreground ml-4 text-sm'
        >
          Ohita
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className='space-y-3'
      >
        <form.Field name='name'>
          {field => (
            <div>
              <label className='mb-1 block text-sm font-medium'>
                Nimimerkki <span className='text-red-500'>*</span>
              </label>
              <input
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={field.state.value}
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

        <form.Field name='email'>
          {field => (
            <div>
              <label className='mb-1 block text-sm font-medium'>Sähköposti</label>
              <input
                type='email'
                className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={field.state.value}
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
            <Button type='submit' size='sm' disabled={isSubmitting}>
              {isSubmitting ? 'Luodaan…' : 'Luo pelaajatili'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
