import { describe, it, expect, beforeEach } from 'vitest'
import {
  gameStore,
  startGame,
  recordTurn,
  editTurn,
  overrideRoundScore,
  confirmHalftime,
  resetGame,
  getRoundScore,
  getNextTurnIndex,
} from './gameStore'

function freshGame() {
  startGame('Koti', ['Alice', 'Bob', 'Carol', 'Dave'], 'Vieras', ['Eve', 'Frank', 'Grace', 'Hank'])
}

beforeEach(() => {
  resetGame()
})

// ── Issue 3: startGame ────────────────────────────────────────────────────────

describe('startGame', () => {
  it('transitions phase from setup to round', () => {
    expect(gameStore.state.phase).toBe('setup')
    freshGame()
    expect(gameStore.state.phase).toBe('round')
  })

  it('sets team names and players', () => {
    freshGame()
    expect(gameStore.state.teams[0].name).toBe('Koti')
    expect(gameStore.state.teams[0].players).toEqual(['Alice', 'Bob', 'Carol', 'Dave'])
    expect(gameStore.state.teams[1].name).toBe('Vieras')
  })

  it('starts at roundIndex 0, turnIndex 0', () => {
    freshGame()
    expect(gameStore.state.roundIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(0)
  })

  it('initialises an empty round 0', () => {
    freshGame()
    const r = gameStore.state.rounds[0]
    expect(r).not.toBeNull()
    expect(r!.teamATurns).toHaveLength(0)
    expect(r!.teamBTurns).toHaveLength(0)
  })
})

// ── getNextTurnIndex helper ───────────────────────────────────────────────────

describe('getNextTurnIndex', () => {
  it('normal: returns next index when neither team cleared', () => {
    expect(getNextTurnIndex(0, false, false)).toBe(1)
    expect(getNextTurnIndex(3, false, false)).toBe(4)
    expect(getNextTurnIndex(6, false, false)).toBe(7)
  })

  it('returns null after the last turn (7)', () => {
    expect(getNextTurnIndex(7, false, false)).toBeNull()
  })

  it('skips team A turns when team A cleared', () => {
    // After turn 0 (team A), next is 1 (team B). Then 2 (team A) is skipped → 3 (team B)
    expect(getNextTurnIndex(0, true, false)).toBe(1)
    expect(getNextTurnIndex(1, true, false)).toBe(3)
    expect(getNextTurnIndex(3, true, false)).toBe(5)
    expect(getNextTurnIndex(5, true, false)).toBe(7)
    expect(getNextTurnIndex(7, true, false)).toBeNull()
  })

  it('skips team B turns when team B cleared', () => {
    expect(getNextTurnIndex(0, false, true)).toBe(2)
    expect(getNextTurnIndex(2, false, true)).toBe(4)
    expect(getNextTurnIndex(4, false, true)).toBe(6)
    expect(getNextTurnIndex(6, false, true)).toBeNull()
  })

  it('returns null when both teams have cleared', () => {
    expect(getNextTurnIndex(0, true, true)).toBeNull()
  })
})

// ── Issue 4: recordTurn — basic flow ─────────────────────────────────────────

describe('recordTurn — basic flow', () => {
  it('appends to the active team and advances turnIndex', () => {
    freshGame()
    recordTurn(5, 1) // turn 0 → team A
    expect(gameStore.state.turnIndex).toBe(1)
    expect(gameStore.state.rounds[0]!.teamATurns).toHaveLength(1)
    expect(gameStore.state.rounds[0]!.teamBTurns).toHaveLength(0)
  })

  it('alternates between teams correctly over 4 turns', () => {
    freshGame()
    recordTurn(5, 1) // turn 0: A
    recordTurn(3, 2) // turn 1: B
    recordTurn(4, 0) // turn 2: A
    recordTurn(2, 1) // turn 3: B
    const r = gameStore.state.rounds[0]!
    expect(r.teamATurns).toHaveLength(2)
    expect(r.teamBTurns).toHaveLength(2)
    expect(gameStore.state.turnIndex).toBe(4)
  })

  it('transitions to halftime after the 8th turn', () => {
    freshGame()
    // 8 turns: A, B, A, B, A, B, A, B
    for (let i = 0; i < 8; i++) {
      recordTurn(3, 1)
    }
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('stores correct akkat and papit values', () => {
    freshGame()
    recordTurn(7, 3)
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.akkat).toBe(7)
    expect(turn.papit).toBe(3)
  })
})

// ── Issue 5: field-cleared bonus ─────────────────────────────────────────────

describe('recordTurn — field cleared', () => {
  it('sets fieldClearedBanner when akkat=0 and papit=0', () => {
    freshGame()
    recordTurn(0, 0) // turn 0: team A clears
    expect(gameStore.state.fieldClearedBanner).not.toBeNull()
    expect(gameStore.state.fieldClearedBanner!.teamIndex).toBe(0)
  })

  it('skips team A remaining turns after field cleared', () => {
    freshGame()
    recordTurn(0, 0) // turn 0: A clears → turns 2, 4, 6 skipped
    expect(gameStore.state.turnIndex).toBe(1) // next is team B turn 0
    recordTurn(3, 1) // turn 1: B
    expect(gameStore.state.turnIndex).toBe(3) // turn 2 (A) skipped
    recordTurn(2, 1) // turn 3: B
    expect(gameStore.state.turnIndex).toBe(5) // turn 4 (A) skipped
    recordTurn(1, 0) // turn 5: B
    expect(gameStore.state.turnIndex).toBe(7) // turn 6 (A) skipped
    recordTurn(4, 2) // turn 7: B → round complete
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('round ends immediately when both teams have cleared', () => {
    freshGame()
    recordTurn(0, 0) // turn 0: A clears
    recordTurn(0, 0) // turn 1: B clears → both cleared, round over
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('normal play unaffected when no field is cleared', () => {
    freshGame()
    recordTurn(5, 1)
    expect(gameStore.state.fieldClearedBanner).toBeNull()
  })
})

// ── Issue 6: editTurn ─────────────────────────────────────────────────────────

describe('editTurn', () => {
  it('overwrites a stored turn', () => {
    freshGame()
    recordTurn(5, 1) // turn 0: team A, teamTurnIndex 0
    editTurn(0, 0, 0, 3, 2)
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.akkat).toBe(3)
    expect(turn.papit).toBe(2)
  })

  it('does not change phase or turnIndex', () => {
    freshGame()
    recordTurn(5, 1)
    const ti = gameStore.state.turnIndex
    editTurn(0, 0, 0, 3, 2)
    expect(gameStore.state.turnIndex).toBe(ti)
    expect(gameStore.state.phase).toBe('round')
  })

  it('recalculates cleared flag after edit removes field-clear', () => {
    freshGame()
    recordTurn(0, 0) // A clears on turn 0
    expect(gameStore.state.rounds[0]!.teamACleared).toBe(true)
    editTurn(0, 0, 0, 5, 1) // change to non-zero
    expect(gameStore.state.rounds[0]!.teamACleared).toBe(false)
  })

  it('recalculates scores correctly after edit', () => {
    freshGame()
    for (let i = 0; i < 8; i++) recordTurn(5, 1) // all turns with 5+1
    // Now in halftime. Edit team A turn 3 (teamTurnIndex=3) in round 0
    editTurn(0, 0, 3, 2, 1)
    const round = gameStore.state.rounds[0]!
    const score = getRoundScore(round, 0)
    // scoreRound uses last turn: akkat=2, papit=1 → 2*(-2)+1*(-1) = -5
    expect(score).toBe(-5)
  })
})

// ── Issue 7: overrideRoundScore ───────────────────────────────────────────────

describe('overrideRoundScore', () => {
  it('stores the override value for the team', () => {
    freshGame()
    for (let i = 0; i < 4; i++) recordTurn(5, 1)
    overrideRoundScore(0, -3)
    expect(gameStore.state.rounds[0]!.teamAOverride).toBe(-3)
  })

  it('override value is used in getRoundScore', () => {
    freshGame()
    recordTurn(5, 1) // team A: would be -11
    overrideRoundScore(0, 99)
    expect(getRoundScore(gameStore.state.rounds[0], 0)).toBe(99)
  })

  it('positive override accepted (field-cleared scenario)', () => {
    freshGame()
    overrideRoundScore(1, 8)
    expect(gameStore.state.rounds[0]!.teamBOverride).toBe(8)
  })
})

// ── Issue 8: confirmHalftime ──────────────────────────────────────────────────

describe('confirmHalftime', () => {
  function reachHalftime() {
    freshGame()
    for (let i = 0; i < 8; i++) recordTurn(3, 1)
  }

  it('transitions from halftime to round', () => {
    reachHalftime()
    expect(gameStore.state.phase).toBe('halftime')
    confirmHalftime(['Alice', 'Bob', 'Carol', 'Dave'], ['Eve', 'Frank', 'Grace', 'Hank'])
    expect(gameStore.state.phase).toBe('round')
  })

  it('sets roundIndex to 1 and turnIndex to 0', () => {
    reachHalftime()
    confirmHalftime(['A', 'B'], ['C', 'D'])
    expect(gameStore.state.roundIndex).toBe(1)
    expect(gameStore.state.turnIndex).toBe(0)
  })

  it('updates player rosters', () => {
    reachHalftime()
    confirmHalftime(['NewA1', 'NewA2'], ['NewB1'])
    expect(gameStore.state.teams[0].players).toEqual(['NewA1', 'NewA2'])
    expect(gameStore.state.teams[1].players).toEqual(['NewB1'])
  })

  it('initialises a fresh round 2', () => {
    reachHalftime()
    confirmHalftime(['A'], ['B'])
    const r = gameStore.state.rounds[1]!
    expect(r.teamATurns).toHaveLength(0)
    expect(r.teamBTurns).toHaveLength(0)
  })

  it('preserves round 1 data', () => {
    reachHalftime()
    const round1Score = getRoundScore(gameStore.state.rounds[0], 0)
    confirmHalftime(['A'], ['B'])
    expect(getRoundScore(gameStore.state.rounds[0], 0)).toBe(round1Score)
  })
})

// ── Issue 9: full state machine ───────────────────────────────────────────────

describe('full state machine: setup → round(0) → halftime → round(1) → finished → setup', () => {
  it('completes the entire flow', () => {
    expect(gameStore.state.phase).toBe('setup')

    freshGame()
    expect(gameStore.state.phase).toBe('round')
    expect(gameStore.state.roundIndex).toBe(0)

    for (let i = 0; i < 8; i++) recordTurn(3, 1)
    expect(gameStore.state.phase).toBe('halftime')

    confirmHalftime(['Alice', 'Bob', 'Carol', 'Dave'], ['Eve', 'Frank', 'Grace', 'Hank'])
    expect(gameStore.state.phase).toBe('round')
    expect(gameStore.state.roundIndex).toBe(1)

    for (let i = 0; i < 8; i++) recordTurn(3, 1)
    expect(gameStore.state.phase).toBe('finished')

    resetGame()
    expect(gameStore.state.phase).toBe('setup')
    expect(gameStore.state.teams[0].name).toBe('')
    expect(gameStore.state.rounds[0]).toBeNull()
  })
})

// ── resetGame ─────────────────────────────────────────────────────────────────

describe('resetGame', () => {
  it('resets all state to initial values', () => {
    freshGame()
    recordTurn(5, 1)
    resetGame()
    expect(gameStore.state.phase).toBe('setup')
    expect(gameStore.state.teams[0].name).toBe('')
    expect(gameStore.state.rounds[0]).toBeNull()
    expect(gameStore.state.turnIndex).toBe(0)
  })
})
