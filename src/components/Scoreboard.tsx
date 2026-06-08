import { getRoundScore } from '@/lib/gameStore'
import type { RoundData } from '@/lib/gameStore'
import { scoreGame } from '@/lib/scoring'

interface ScoreboardProps {
  teamAName: string
  teamBName: string
  round1: RoundData | null
  round2: RoundData | null
  roundIndex: 0 | 1
}

export function Scoreboard({ teamAName, teamBName, round1, round2, roundIndex }: ScoreboardProps) {
  const r1A = getRoundScore(round1, 0)
  const r1B = getRoundScore(round1, 1)
  const r2A = getRoundScore(round2, 0)
  const r2B = getRoundScore(round2, 1)

  const showTotal = roundIndex === 1 && round1 !== null
  const currentA = roundIndex === 0 ? r1A : r2A
  const currentB = roundIndex === 0 ? r1B : r2B

  return (
    <section className='glass-panel rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm'>
      <div className='flex justify-between w-full items-center flex-col xs:flex-row xs:items-start gap-y-3'>
        <div className='text-center flex-1'>
          <p className='text-label-caps text-muted-foreground mb-1'>{teamAName.toUpperCase()}</p>
          <p className='text-score-display text-primary transition-all duration-300'>{currentA}</p>
        </div>

        <div className='flex flex-col items-center justify-center px-4 gap-1 self-center'>
          <span className='text-label-caps text-muted-foreground bg-muted px-2 py-1 rounded-full'>
            ERÄ {roundIndex + 1}
          </span>
          <p className='text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60'>
            pisteet
          </p>
        </div>

        <div className='text-center flex-1'>
          <p className='text-label-caps text-muted-foreground mb-1'>{teamBName.toUpperCase()}</p>
          <p className='text-score-display text-foreground transition-all duration-300'>{currentB}</p>
        </div>
      </div>

      {showTotal && (() => {
        const game = scoreGame({ teamA: r1A, teamB: r1B }, { teamA: r2A, teamB: r2B })
        return (
          <>
            <div className='w-full h-px bg-border/40' />
            <div className='flex gap-3 text-[12px] text-muted-foreground flex-wrap justify-center'>
              <span>Erä 1: {r1A} - {r1B}</span>
              <span>•</span>
              <span className='font-bold'>Yhteensä: {game.teamA} - {game.teamB}</span>
            </div>
          </>
        )
      })()}
    </section>
  )
}
