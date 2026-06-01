import { createTeam } from '@/features/teams/mutations'
import { teamCreateSchema } from '@/features/teams/schemas'
import type { TeamCreateInput } from '@/features/teams/schemas'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

export const Route = createFileRoute('/_authenticated/teams/new')({
  component: NewTeamPage,
})

function NewTeamPage() {
  const navigate = useNavigate()

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Uusi joukkue</h1>
      <div className='rounded-lg border p-4'>
        <TeamForm onSuccess={() => navigate({ to: '/teams', replace: true })} />
      </div>
    </div>
  )
}

function TeamForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: TeamCreateInput
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: TeamCreateInput) => createTeam({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      onSuccess()
    },
    meta: {
      successMessage: 'Joukkue luotu!',
      errorMessage: 'Joukkueen luonti epäonnistui.',
    },
  })

  const form = useForm({
    defaultValues: defaultValues ?? {
      name: '',
      home: '',
      description: '',
      contactEmail: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = teamCreateSchema.parse(value)
      await createMutation.mutateAsync(parsed)
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

      <form.Field name='home'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>Kotipaikka</label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={field.state.value}
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
              value={field.state.value}
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
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Tallennetaan…' : 'Tallenna'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
