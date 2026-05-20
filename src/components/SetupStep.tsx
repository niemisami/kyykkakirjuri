import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { startGame } from '@/lib/gameStore'

const PLAYER_COUNT = 4

const GameSetupFormSchema = z.object({
  teamA: z.object({
    name: z.string().min(1, 'Joukkueen nimi ei voi olla tyhjä'),
    players: z
      .array(z.object({ name: z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä') }))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
  teamB: z.object({
    name: z.string().min(1, 'Joukkueen nimi ei voi olla tyhjä'),
    players: z
      .array(z.object({ name: z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä') }))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),

  }),
})

export function SetupStep() {
  const form = useForm({
    defaultValues: {
      teamA: { name: '', players: Array.from({ length: PLAYER_COUNT }, () => ({ name: '' })) },
      teamB: { name: '', players: Array.from({ length: PLAYER_COUNT }, () => ({ name: '' })) },
    },
    validators: { onSubmit: GameSetupFormSchema },
    onSubmit: ({ value }) => {
      startGame(
        value.teamA.name,
        value.teamA.players.map((p) => p.name),
        value.teamB.name,
        value.teamB.players.map((p) => p.name),
      )
    },
  })

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Kyykkakirjuri</h1>
        <p className="mt-1 text-muted-foreground">Syötä joukkueet ja pelaajat</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-8"
      >
        {(['teamA', 'teamB'] as const).map((teamKey, idx) => (
          <section key={teamKey} className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">Joukkue {idx === 0 ? 'A' : 'B'}</h2>

            {/* Team name */}
            <form.Field name={`${teamKey}.name`}>
              {(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                    Joukkueen nimi
                  </label>
                  <input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Joukkueen nimi"
                    className="w-full rounded-lg border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-destructive">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Players */}
            <form.Field name={`${teamKey}.players`} mode="array">
              {(playersField) => (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Pelaajat</label>

                  {playersField.state.value.map((_, i) => (
                    <form.Field key={i} name={`${teamKey}.players[${i}].name`}>
                      {(subField) => (
                        <div className="space-y-1">
                          <input
                            value={subField.state.value}
                            onChange={(e) => subField.handleChange(e.target.value)}
                            onBlur={subField.handleBlur}
                            placeholder={`Pelaaja ${i + 1}`}
                            className="w-full rounded-lg border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          {subField.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                              {subField.state.meta.errors.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  ))}
                </div>
              )}
            </form.Field>
          </section>
        ))}

        <Button type="submit" size="lg" className="w-full">
          Aloita peli
        </Button>
      </form>
    </main>
  )
}
