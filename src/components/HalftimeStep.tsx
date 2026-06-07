import { getRoundScore } from '@/lib/gameStore'
import type { GameState } from '@/lib/gameStore'
import { ArrowLeftRight } from 'lucide-react'
import { TeamOrderForm } from './TeamOrderForm'

interface HalftimeStepProps {
  state: GameState
}

export function HalftimeStep({ state }: HalftimeStepProps) {
  const { teams, rounds } = state
  const round1 = rounds[0]
  const scoreA = getRoundScore(round1, 0)
  const scoreB = getRoundScore(round1, 1)

  return (
    <div className='mx-auto max-w-[600px] px-4 pt-20 pb-8 space-y-6'>
      <div className='text-center'>
        <h1 className='text-headline-lg font-black'>Erätauko</h1>
        <p className='text-muted-foreground mt-1'>Erä 1 on päättynyt</p>
      </div>

      {/* Round 1 scores */}
      <section className='glass-panel rounded-3xl p-6 shadow-sm grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto_auto]'>
        <p className='text-label-caps text-muted-foreground text-center col-start-1 row-start-1 flex items-end justify-center pb-1'>{teams[0].name.toUpperCase()}</p>
        <p className='text-score-display text-primary text-center col-start-1 row-start-2'>{scoreA}</p>
        <p className='text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 text-center col-start-1 row-start-3 pt-1'>pistettä</p>

        <div className='text-label-caps text-muted-foreground/60 col-start-2 row-start-1 row-span-3 flex items-center justify-center px-4'>VS</div>

        <p className='text-label-caps text-muted-foreground text-center col-start-3 row-start-1 flex items-end justify-center pb-1'>{teams[1].name.toUpperCase()}</p>
        <p className='text-score-display text-foreground text-center col-start-3 row-start-2'>{scoreB}</p>
        <p className='text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 text-center col-start-3 row-start-3 pt-1'>pistettä</p>
      </section>

      {/* Side swap info */}
      <div className='glass-panel rounded-2xl p-4 text-center text-sm text-muted-foreground shadow-sm flex items-center justify-center gap-2'>
        <ArrowLeftRight size={14} /> Joukkueet vaihtavat puolia erässä 2
      </div>

      <TeamOrderForm teams={teams} gameMode={state.mode} />
    </div>
  )
}
