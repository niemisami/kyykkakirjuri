import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { startGame } from '@/lib/gameStore'

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
      teamA: { name: '', players: [{ name: '' }] },
      teamB: { name: '', players: [{ name: '' }] },
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

            {/* Players array */}
            <form.Field name={`${teamKey}.players`} mode="array">
              {(playersField) => (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Pelaajat</label>

                  {playersField.state.value.map((_, i) => (
                    <form.Field key={i} name={`${teamKey}.players[${i}].name`}>
                      {(subField) => (
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              value={subField.state.value}
                              onChange={(e) => subField.handleChange(e.target.value)}
                              onBlur={subField.handleBlur}
                              placeholder={`Pelaaja ${i + 1}`}
                              className="flex-1 rounded-lg border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {playersField.state.value.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon-lg"
                                onClick={() => playersField.removeValue(i)}
                                aria-label="Poista pelaaja"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                          {subField.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                              {subField.state.meta.errors.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  ))}

                  {playersField.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {playersField.state.meta.errors.join(', ')}
                    </p>
                  )}

                  {playersField.state.value.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => playersField.pushValue({ name: '' })}
                    >
                      + Lisää pelaaja
                    </Button>
                  )}
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
