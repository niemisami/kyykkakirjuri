import { getRoundScore, type RoundData } from '@/lib/gameStore'
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

  return (
    <div className="bg-muted rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-sm">
      <div className="font-semibold truncate">{teamAName}</div>
      <div className="text-muted-foreground font-medium">Erä {roundIndex + 1}</div>
      <div className="font-semibold truncate">{teamBName}</div>

      <div className="text-xl font-bold">{roundIndex === 0 ? r1A : r2A}</div>
      <div className="text-muted-foreground text-xs self-center">pistettä</div>
      <div className="text-xl font-bold">{roundIndex === 0 ? r1B : r2B}</div>

      {showTotal && (() => {
        const game = scoreGame({ teamA: r1A, teamB: r1B }, { teamA: r2A, teamB: r2B })
        return (
          <>
            <div className="text-muted-foreground text-xs">Yhteensä: {game.teamA}</div>
            <div />
            <div className="text-muted-foreground text-xs">Yhteensä: {game.teamB}</div>
          </>
        )
      })()}
    </div>
  )
}
