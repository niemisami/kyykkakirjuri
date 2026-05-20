import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { confirmHalftime, getRoundScore, type GameState } from '@/lib/gameStore'

const HalftimeFormSchema = z.object({
  teamA: z.object({
    players: z
      .array(z.object({ name: z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä') }))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
  teamB: z.object({
    players: z
      .array(z.object({ name: z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä') }))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
})

interface HalftimeStepProps {
  state: GameState
}

export function HalftimeStep({ state }: HalftimeStepProps) {
  const { teams, rounds } = state
  const round1 = rounds[0]
  const scoreA = getRoundScore(round1, 0)
  const scoreB = getRoundScore(round1, 1)

  const form = useForm({
    defaultValues: {
      teamA: { players: teams[0].players.map((name) => ({ name })) },
      teamB: { players: teams[1].players.map((name) => ({ name })) },
    },
    validators: { onSubmit: HalftimeFormSchema },
    onSubmit: ({ value }) => {
      confirmHalftime(
        value.teamA.players.map((p) => p.name),
        value.teamB.players.map((p) => p.name),
      )
    },
  })

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Erätauko</h1>
        <p className="text-muted-foreground mt-1">Erä 1 on päättynyt</p>
      </div>

      {/* Round 1 scores */}
      <div className="rounded-xl border p-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="font-semibold">{teams[0].name}</p>
          <p className="text-3xl font-bold mt-1">{scoreA}</p>
          <p className="text-xs text-muted-foreground">pistettä</p>
        </div>
        <div>
          <p className="font-semibold">{teams[1].name}</p>
          <p className="text-3xl font-bold mt-1">{scoreB}</p>
          <p className="text-xs text-muted-foreground">pistettä</p>
        </div>
      </div>

      {/* Side swap info */}
      <div className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">
        ⇄ Joukkueet vaihtavat puolia erässä 2
      </div>

      {/* Player substitutions */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {(['teamA', 'teamB'] as const).map((teamKey, idx) => (
          <section key={teamKey} className="space-y-3 rounded-xl border p-4">
            <h2 className="font-semibold">{teams[idx].name} – pelaajat erässä 2</h2>

            <form.Field name={`${teamKey}.players`} mode="array">
              {(playersField) => (
                <div className="space-y-2">
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
          Aloita erä 2
        </Button>
      </form>
    </div>
  )
}
