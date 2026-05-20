import { Button } from '@/components/ui/button'
import { resetGame, getRoundScore, type GameState } from '@/lib/gameStore'
import { scoreGame } from '@/lib/scoring'

interface ResultsStepProps {
  state: GameState
}

export function ResultsStep({ state }: ResultsStepProps) {
  const { teams, rounds } = state
  const round1 = rounds[0]
  const round2 = rounds[1]

  const r1A = getRoundScore(round1, 0)
  const r1B = getRoundScore(round1, 1)
  const r2A = getRoundScore(round2, 0)
  const r2B = getRoundScore(round2, 1)

  const game = scoreGame({ teamA: r1A, teamB: r1B }, { teamA: r2A, teamB: r2B })

  const winnerText =
    game.winner === 'tie'
      ? 'Tasapeli!'
      : game.winner === 'teamA'
        ? `${teams[0].name} voittaa!`
        : `${teams[1].name} voittaa!`

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Peli valmis</h1>
        <p className="text-xl font-semibold mt-2">{winnerText}</p>
      </div>

      {/* Final scores summary */}
      <div className="rounded-xl border p-4 space-y-3">
        <h2 className="font-semibold text-center text-muted-foreground">Lopputulos</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="font-semibold">{teams[0].name}</div>
          <div />
          <div className="font-semibold">{teams[1].name}</div>

          <div>{r1A}</div>
          <div className="text-xs text-muted-foreground self-center">Erä 1</div>
          <div>{r1B}</div>

          <div>{r2A}</div>
          <div className="text-xs text-muted-foreground self-center">Erä 2</div>
          <div>{r2B}</div>

          <div className="text-2xl font-bold border-t pt-2">{game.teamA}</div>
          <div className="self-center border-t pt-2 text-muted-foreground text-xs">Yhteensä</div>
          <div className="text-2xl font-bold border-t pt-2">{game.teamB}</div>
        </div>
      </div>

      {/* Per-turn breakdown */}
      <div className="rounded-xl border p-4 space-y-4">
        <h2 className="font-semibold text-muted-foreground">Vuorot eriteltynä</h2>
        {([0, 1] as const).map((ri) => {
          const round = rounds[ri]
          if (!round) return null
          return (
            <div key={ri} className="space-y-2">
              <h3 className="text-sm font-semibold">Erä {ri + 1}</h3>
              <div className="grid grid-cols-2 gap-2">
                {([0, 1] as const).map((ti) => {
                  const turns = ti === 0 ? round.teamATurns : round.teamBTurns
                  const override = ti === 0 ? round.teamAOverride : round.teamBOverride
                  return (
                    <div key={ti} className="space-y-1">
                      <p className="text-xs font-medium">{teams[ti].name}</p>
                      {turns.map((turn, i) => (
                        <div
                          key={i}
                          className="text-xs bg-muted/50 rounded px-2 py-1 flex justify-between"
                        >
                          <span>Vuoro {i + 1}</span>
                          <span>
                            {turn.result.fieldCleared
                              ? `+${turn.result.unusedKartut}`
                              : `A:${turn.akkat} P:${turn.papit}`}
                          </span>
                        </div>
                      ))}
                      {override !== undefined && (
                        <div className="text-xs bg-yellow-100 rounded px-2 py-1 flex justify-between">
                          <span>Korjaus</span>
                          <span>{override}p</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Button size="lg" className="w-full" onClick={resetGame}>
        Uusi peli
      </Button>
    </div>
  )
}
