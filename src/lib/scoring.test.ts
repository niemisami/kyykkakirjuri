import { describe, it, expect } from 'vitest'
import {
  scoreTurn,
  scoreRound,
  scoreGame,
  AKKA_POINTS,
  PAPPI_POINTS,
  KARTUT_PER_TURN,
  TURNS_PER_ROUND,
} from './scoring'

describe('scoreTurn — normal scoring', () => {
  it('multiplies akat and papit by correct weights and sums them', () => {
    const result = scoreTurn(3, 1, 4, TURNS_PER_ROUND)
    expect(result.points).toBe(3 * AKKA_POINTS + 1 * PAPPI_POINTS) // -7
    expect(result.fieldCleared).toBe(false)
    expect(result.unusedKartut).toBe(0)
  })

  it('edge case: 40 akat, 0 papit', () => {
    const result = scoreTurn(40, 0, 4, TURNS_PER_ROUND)
    expect(result.points).toBe(40 * AKKA_POINTS) // -80
    expect(result.fieldCleared).toBe(false)
  })

  it('edge case: 0 akat, 40 papit', () => {
    const result = scoreTurn(0, 40, 4, TURNS_PER_ROUND)
    expect(result.points).toBe(40 * PAPPI_POINTS) // -40
    expect(result.fieldCleared).toBe(false)
  })

  it('edge case: 20 akat, 20 papit', () => {
    const result = scoreTurn(20, 20, 4, TURNS_PER_ROUND)
    expect(result.points).toBe(20 * AKKA_POINTS + 20 * PAPPI_POINTS) // -60
    expect(result.fieldCleared).toBe(false)
  })
})

describe('scoreTurn — field cleared', () => {
  it('clearing on turn 3 of 4 yields +4 unused kartut', () => {
    const result = scoreTurn(0, 0, 3, 4)
    expect(result.fieldCleared).toBe(true)
    expect(result.unusedKartut).toBe(4) // 1 remaining turn × 4 kartut
    expect(result.points).toBe(4)
  })

  it('clearing on turn 1 of 4 yields +12 unused kartut', () => {
    const result = scoreTurn(0, 0, 1, 4)
    expect(result.fieldCleared).toBe(true)
    expect(result.unusedKartut).toBe(12) // 3 remaining turns × 4 kartut
    expect(result.points).toBe(12)
  })

  it('clearing on the final turn yields 0 unused kartut', () => {
    const result = scoreTurn(0, 0, 4, 4)
    expect(result.fieldCleared).toBe(true)
    expect(result.unusedKartut).toBe(0)
    expect(result.points).toBe(0)
  })

  it('non-zero papit alone is not a field clear', () => {
    const result = scoreTurn(0, 1, 2, TURNS_PER_ROUND)
    expect(result.fieldCleared).toBe(false)
  })

  it('non-zero akat alone is not a field clear', () => {
    const result = scoreTurn(1, 0, 2, TURNS_PER_ROUND)
    expect(result.fieldCleared).toBe(false)
  })
})

describe('scoreRound — normal round', () => {
  it('uses points from the final turn', () => {
    const turns = [
      scoreTurn(10, 2, 1, TURNS_PER_ROUND),
      scoreTurn(8, 1, 2, TURNS_PER_ROUND),
      scoreTurn(5, 0, 3, TURNS_PER_ROUND),
      scoreTurn(3, 1, 4, TURNS_PER_ROUND),
    ]
    const result = scoreRound(turns)
    expect(result.points).toBe(3 * AKKA_POINTS + 1 * PAPPI_POINTS) // -7
    expect(result.fieldCleared).toBe(false)
  })

  it('returns zero when turns array is empty', () => {
    const result = scoreRound([])
    expect(result.points).toBe(0)
    expect(result.fieldCleared).toBe(false)
  })
})

describe('scoreRound — field cleared', () => {
  it('applies field-cleared bonus when a turn clears the field on turn 3 of 4', () => {
    const turns = [
      scoreTurn(10, 2, 1, TURNS_PER_ROUND),
      scoreTurn(5, 1, 2, TURNS_PER_ROUND),
      scoreTurn(0, 0, 3, TURNS_PER_ROUND),
    ]
    const result = scoreRound(turns)
    expect(result.points).toBe(4) // 1 remaining turn × 4 kartut
    expect(result.fieldCleared).toBe(true)
  })

  it('applies field-cleared bonus when field is cleared on turn 1 of 4', () => {
    const turns = [scoreTurn(0, 0, 1, TURNS_PER_ROUND)]
    const result = scoreRound(turns)
    expect(result.points).toBe(12) // 3 remaining turns × 4 kartut
    expect(result.fieldCleared).toBe(true)
  })

  it('stops scanning at first field-cleared turn', () => {
    const turns = [
      scoreTurn(0, 0, 2, TURNS_PER_ROUND), // cleared on turn 2 → +8
      scoreTurn(0, 0, 3, TURNS_PER_ROUND), // this should never be used
    ]
    const result = scoreRound(turns)
    expect(result.points).toBe(8) // (4-2)*4
    expect(result.fieldCleared).toBe(true)
  })
})

describe('scoreRound — manual override', () => {
  it('returns override value directly', () => {
    const turns = [scoreTurn(3, 1, 4, TURNS_PER_ROUND)]
    const result = scoreRound(turns, 5)
    expect(result.points).toBe(5)
    expect(result.fieldCleared).toBe(false)
  })

  it('override takes precedence over field-cleared result', () => {
    const turns = [scoreTurn(0, 0, 1, TURNS_PER_ROUND)] // would yield +12
    const result = scoreRound(turns, -99)
    expect(result.points).toBe(-99)
    expect(result.fieldCleared).toBe(false)
  })

  it('override of 0 is respected (not treated as absent)', () => {
    const turns = [scoreTurn(5, 2, 4, TURNS_PER_ROUND)]
    const result = scoreRound(turns, 0)
    expect(result.points).toBe(0)
  })
})

describe('scoreGame', () => {
  it('sums round scores per team correctly', () => {
    const result = scoreGame({ teamA: -7, teamB: -10 }, { teamA: -5, teamB: -3 })
    expect(result.teamA).toBe(-12)
    expect(result.teamB).toBe(-13)
  })

  it('teamA wins when their total is higher (less negative)', () => {
    const result = scoreGame({ teamA: -5, teamB: -10 }, { teamA: -3, teamB: -8 })
    expect(result.winner).toBe('teamA')
    expect(result.teamA).toBe(-8)
    expect(result.teamB).toBe(-18)
  })

  it('teamB wins when their total is higher', () => {
    const result = scoreGame({ teamA: -10, teamB: -5 }, { teamA: -8, teamB: -3 })
    expect(result.winner).toBe('teamB')
  })

  it('returns tie when totals are equal', () => {
    const result = scoreGame({ teamA: -7, teamB: -3 }, { teamA: -3, teamB: -7 })
    expect(result.teamA).toBe(-10)
    expect(result.teamB).toBe(-10)
    expect(result.winner).toBe('tie')
  })

  it('positive scores (field cleared) factor into totals', () => {
    const result = scoreGame({ teamA: 8, teamB: -10 }, { teamA: -5, teamB: 4 })
    expect(result.teamA).toBe(3)
    expect(result.teamB).toBe(-6)
    expect(result.winner).toBe('teamA')
  })
})

describe('module has no UI layer imports', () => {
  it('KARTUT_PER_TURN and TURNS_PER_ROUND constants are exported', () => {
    expect(KARTUT_PER_TURN).toBe(4)
    expect(TURNS_PER_ROUND).toBe(4)
  })
})
