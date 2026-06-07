import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Player, PlayerCreateInput } from '@/features/players/schemas'
import { initialPlayer, playerCreateSchema } from '@/features/players/schemas'
import { useForm } from '@tanstack/react-form'
import { TeamSelectInput } from '../teams/TeamSelectInput'

export function PlayerForm({
  player,
  defaultValues = initialPlayer,
  submitLabel,
  onSubmit,
}: {
  player?: Player
  defaultValues?: PlayerCreateInput
  submitLabel: string
  onSubmit: (value: PlayerCreateInput) => void
}) {
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => onSubmit(value),
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
      {player && (
        <div className='flex items-center gap-3'>
          <Avatar
            size='lg'
            style={{ viewTransitionName: `player-avatar-${player.id}` }}
          >
            <AvatarImage src={player.user?.image ?? undefined} alt={player.name} />
            <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span
            className='text-sm font-medium'
            style={{ viewTransitionName: `player-name-${player.id}` }}
          >
            {player.name}
          </span>
        </div>
      )}
      <form.Field name='name'>
        {field => (
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Nimimerkki <span className='text-red-500'>*</span>
            </label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className='mt-1 text-xs text-red-500'>
                {String(field.state.meta.errors[0]?.message)}
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
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className='mt-1 text-xs text-red-500'>
                {String(field.state.meta.errors[0]?.message)}
              </p>
            )}
          </div>
        )}
      </form.Field>
      <form.Field name='teamId'>
        {field =>
          <TeamSelectInput value={field.state.value || null} onChange={field.handleChange} clearable={false} />}
      </form.Field>

      <form.Subscribe selector={s => s.isSubmitting}>
        {isSubmitting => (
          <Button type='submit' size='sm' disabled={isSubmitting}>
            {isSubmitting ? 'Tallennetaan…' : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
