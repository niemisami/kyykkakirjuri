import { resetGame, getRoundScore } from '@/lib/gameStore'
import type { GameState } from '@/lib/gameStore'
import { scoreGame } from '@/lib/scoring'
import { deriveAkat } from '@/lib/schemas'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
    <div className='mx-auto max-w-150 px-4 pt-20 pb-8 space-y-6'>
      <div className='text-center'>
        <h1 className='text-headline-lg font-black'>Peli ohi</h1>
        <p className='text-body-lg font-semibold mt-2 text-primary'>{winnerText}</p>
      </div>

      {/* Final scores */}
      <section className='glass-panel rounded-3xl p-6 shadow-sm'>
        <p className='text-label-caps text-muted-foreground text-center mb-4'>Lopputulos</p>
        <div className='flex justify-around items-start'>
          <div className='text-center flex-1'>
            <p className='text-label-caps text-muted-foreground mb-1'>{teams[0].name.toUpperCase()}</p>
            <p className='text-score-display text-primary'>{game.teamA}</p>
          </div>
          <div className='flex flex-col items-center justify-center px-4 pt-4 gap-1'>
            <span className='text-label-caps text-muted-foreground/60'>YHT.</span>
          </div>
          <div className='text-center flex-1'>
            <p className='text-label-caps text-muted-foreground mb-1'>{teams[1].name.toUpperCase()}</p>
            <p className='text-score-display text-foreground'>{game.teamB}</p>
          </div>
        </div>
        <div className='w-full h-px bg-border/40 my-4' />
        <div className='grid grid-cols-3 gap-2 text-center text-sm'>
          <div className='font-medium'>{r1A}</div>
          <div className='text-label-caps text-muted-foreground self-center'>Erä 1</div>
          <div className='font-medium'>{r1B}</div>
          <div className='font-medium'>{r2A}</div>
          <div className='text-label-caps text-muted-foreground self-center'>Erä 2</div>
          <div className='font-medium'>{r2B}</div>
        </div>
      </section>

      {/* Per-turn breakdown */}
      <section className='glass-panel rounded-2xl p-5 shadow-sm'>
        <h2 className='text-label-caps text-muted-foreground'>Vuorot eriteltynä</h2>
        <div className='mt-4 flex flex-col gap-4'>
          {([0, 1] as const).map((ri) => {
            const round = rounds[ri]
            if(!round) return null
            return (
              <div key={ri} className='flex flex-col gap-2'>
                <h3 className='text-sm font-semibold'>Erä {ri + 1}</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {([0, 1] as const).map((ti) => {
                    const turns = ti === 0 ? round.teamATurns : round.teamBTurns
                    const override = ti === 0 ? round.teamAOverride : round.teamBOverride
                    return (
                      <div key={ti} className='flex flex-col gap-1'>
                        <p className='text-label-caps text-muted-foreground'>{teams[ti].name}</p>
                        {turns.map((turn, i) => {
                          const throwsSoFar = turns
                            .slice(0, i + 1)
                            .flatMap(t => Array.from(t.throws))
                          const akat = deriveAkat(throwsSoFar)
                          const papit = turn.throws.reduce((sum, t) => sum + t.pappiCount, 0)
                          const totalKnockOuts = turn.throws.reduce((sum, t) => sum + t.knockedOut, 0)
                          return (
                            <Collapsible
                              key={i}
                              className='rounded-lg border border-border/30 bg-white/60 px-2 py-1'
                            >
                              <CollapsibleTrigger className='mt-1 text-xs text-muted-foreground cursor-pointer w-full'>
                                <div className='flex items-center justify-between'>
                                  <span>Vuoro {i + 1}</span>
                                  <span>
                                    {turn.result.fieldCleared
                                      ? `+${turn.result.unusedKartut}`
                                      : `A:${akat} K:${totalKnockOuts} P:${papit}`}
                                  </span>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className='pt-1'>
                                <div className='flex flex-col gap-1'>
                                  <span className='text-xs px-2 py-1'>Pelaajien heitot</span>
                                  {turn.throws.map((playerThrow, throwIndex) => (
                                    <div
                                      key={throwIndex}
                                      className='flex items-center justify-between rounded bg-background/70 px-2 py-1 text-xs'
                                    >
                                      <span>Heitto {throwIndex + 1}</span>
                                      <span>K:{playerThrow.knockedOut} P:{playerThrow.pappiCount}</span>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        })}
                        {override !== undefined && (
                          <div className='text-xs bg-accent rounded-lg px-2 py-1 flex justify-between border border-border/30'>
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
      </section>

      <button
        onClick={resetGame}
        className='w-full h-12 bg-primary-container text-primary-container-foreground rounded-xl font-bold text-body-lg active:scale-95 transition-all shadow-lg'
      >
        Uusi peli
      </button>
    </div>
  )
}
