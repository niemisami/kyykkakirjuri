import { beforeEach, describe, expect, it } from 'vitest'
import {
  confirmHalftime,
  editPlayerThrow,
  editTurn,
  gameStore,
  getNextTurnIndex,
  getRoundScore,
  overrideRoundScore,
  recordPlayerThrow,
  resetGame,
  startGame,
} from './gameStore'
import { deriveAkat } from './schemas'

function freshGame() {
  startGame(
    'Koti',
    [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }, { name: 'Dave' }],
    'Vieras',
    [{ name: 'Eve' }, { name: 'Frank' }, { name: 'Grace' }, { name: 'Hank' }]
  )
}

/** Record a neutral (non-clearing) turn with two throws — field remains unchanged. */
function recordNeutralTeamTurn() {
  recordPlayerThrow(0, 0) // throw 1: nothing knocked out
  recordPlayerThrow(0, 0) // throw 2: nothing knocked out
  recordPlayerThrow(0, 0) // throw 2: nothing knocked out
  recordPlayerThrow(0, 0) // throw 2: nothing knocked out
}

/** Record a clearing turn on throw 1 — all 40 knocked out. */
function recordClearingTurn() {
  recordPlayerThrow(40, 0) // throw 1: field cleared
}

beforeEach(() => {
  resetGame()
})

describe('single-throw progression', () => {
  it('starts a round with player and throw indices at zero', () => {
    freshGame()
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.singleThrowIndex).toBe(0)
  })

  it('progresses as P1-T1 -> P1-T2 -> P2-T1 -> P2-T2 -> next team turn', () => {
    freshGame()

    recordPlayerThrow(0, 0)
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.singleThrowIndex).toBe(1)
    expect(gameStore.state.turnIndex).toBe(0)

    recordPlayerThrow(0, 0)
    expect(gameStore.state.playerThrowIndex).toBe(1)
    expect(gameStore.state.singleThrowIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(0)

    recordPlayerThrow(0, 0)
    expect(gameStore.state.playerThrowIndex).toBe(1)
    expect(gameStore.state.singleThrowIndex).toBe(1)
    expect(gameStore.state.turnIndex).toBe(0)

    recordPlayerThrow(0, 0)
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.singleThrowIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(1)
    expect(gameStore.state.rounds[0]!.teamATurns[0].throws).toHaveLength(4)
  })

  it('stores all 4 single throws in a complete team turn', () => {
    freshGame()
    recordPlayerThrow(3, 0)
    recordPlayerThrow(1, 0)
    recordPlayerThrow(2, 1)
    recordPlayerThrow(0, 1)
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws).toEqual([
      { knockedOut: 3, pappiCount: 0 },
      { knockedOut: 1, pappiCount: 0 },
      { knockedOut: 2, pappiCount: 1 },
      { knockedOut: 0, pappiCount: 1 },
    ])
  })
})

describe('field-cleared in single-throw mode', () => {
  it('clearing on first single throw gives +15 bonus on turn 1', () => {
    freshGame()
    recordPlayerThrow(40, 0)
    expect(gameStore.state.fieldClearedBanner?.bonus).toBe(15)
    expect(gameStore.state.turnIndex).toBe(1)
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.singleThrowIndex).toBe(0)
    expect(gameStore.state.rounds[0]!.teamATurns[0].throws).toHaveLength(1)
  })

  it('clearing on third single throw gives +13 bonus on turn 1', () => {
    freshGame()
    recordPlayerThrow(0, 0)
    recordPlayerThrow(0, 0)
    recordPlayerThrow(40, 0)
    expect(gameStore.state.fieldClearedBanner?.bonus).toBe(13)
    expect(gameStore.state.turnIndex).toBe(1)
  })
})

describe('editing a single throw', () => {
  it('recomputes later throws and keeps round score coherent', () => {
    freshGame()
    recordNeutralTeamTurn()
    editPlayerThrow(0, 0, 0, 3, 37, 1)
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws[3]).toEqual({ knockedOut: 37, pappiCount: 1 })
    expect(turn.result.points).toBe(-5)
    expect(getRoundScore(gameStore.state.rounds[0], 0)).toBe(-5)
  })

  it('editing throw 1 to clear truncates remaining throws', () => {
    freshGame()
    recordNeutralTeamTurn()
    editPlayerThrow(0, 0, 0, 0, 40, 0)
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws).toHaveLength(1)
    expect(turn.result.fieldCleared).toBe(true)
  })
})

describe('round flow and halftime', () => {
  it('reaches halftime after 8 team turns of neutral throws', () => {
    freshGame()
    for(let i = 0; i < 8; i++) recordNeutralTeamTurn()
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('confirmHalftime resets throw progress for round 2', () => {
    freshGame()
    for(let i = 0; i < 8; i++) recordNeutralTeamTurn()
    confirmHalftime(['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H'])
    expect(gameStore.state.roundIndex).toBe(1)
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.singleThrowIndex).toBe(0)
  })
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
    expect(gameStore.state.teams[0].players).toEqual([
      { name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }, { name: 'Dave' },
    ])
    expect(gameStore.state.teams[1].name).toBe('Vieras')
  })

  it('starts at roundIndex 0, turnIndex 0, playerThrowIndex 0', () => {
    freshGame()
    expect(gameStore.state.roundIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(0)
    expect(gameStore.state.playerThrowIndex).toBe(0)
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

// ── Issue 4: recordPlayerThrow — basic flow ───────────────────────────────────

describe('recordPlayerThrow — basic flow', () => {
  it('throw 2 finalises the turn and advances turnIndex', () => {
    freshGame()
    recordPlayerThrow(0, 0) // throw 1
    recordPlayerThrow(0, 0) // throw 2
    recordPlayerThrow(0, 0) // throw 2
    recordPlayerThrow(0, 0) // throw 2
    expect(gameStore.state.singleThrowIndex).toBe(0)
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(1)
    expect(gameStore.state.rounds[0]!.teamATurns).toHaveLength(1) // still 1 turn, now complete
    expect(gameStore.state.rounds[0]!.teamATurns[0].throws).toHaveLength(4)
  })

  it('stores correct throw data', () => {
    freshGame()
    recordPlayerThrow(5, 0) // throw 1
    recordPlayerThrow(3, 1) // throw 2
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws[0]).toEqual({ knockedOut: 5, pappiCount: 0 })
    expect(turn.throws[1]).toEqual({ knockedOut: 3, pappiCount: 1 })
  })

  it('alternates between teams correctly over 4 turns', () => {
    freshGame()
    recordNeutralTeamTurn() // turn 0: A
    recordNeutralTeamTurn() // turn 1: B
    recordNeutralTeamTurn() // turn 2: A
    recordNeutralTeamTurn() // turn 3: B
    const r = gameStore.state.rounds[0]!
    expect(r.teamATurns).toHaveLength(2)
    expect(r.teamBTurns).toHaveLength(2)
    expect(gameStore.state.turnIndex).toBe(4)
  })

  it('transitions to halftime after all 8 turns', () => {
    freshGame()
    for(let i = 0; i < 16; i++) recordNeutralTeamTurn()
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('playerThrowIndex resets to 0 at the start of each new turn', () => {
    freshGame()
    recordNeutralTeamTurn() // complete turn 0
    expect(gameStore.state.playerThrowIndex).toBe(0)
    recordPlayerThrow(0, 0) // start turn 1 player throw 1
    recordPlayerThrow(0, 0) // start turn 1 pleyar throw 2
    expect(gameStore.state.playerThrowIndex).toBe(1)
  })
})

// ── Issue 5: field-cleared bonus ─────────────────────────────────────────────

describe('recordPlayerThrow — field cleared', () => {
  it('mid-turn clear on throw 1: sets banner and advances without throw 2', () => {
    freshGame()
    recordPlayerThrow(40, 0) // throw 1: all 40 knocked out → field cleared
    expect(gameStore.state.fieldClearedBanner).not.toBeNull()
    expect(gameStore.state.fieldClearedBanner!.teamIndex).toBe(0)
    // Skipped to next turn without needing throw 2
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(1)
  })

  it('mid-turn clear on throw 1 includes player-2 kartut in bonus', () => {
    freshGame()
    recordPlayerThrow(40, 0) // turn 1 of 4, throw 1 → 1 + 2*4 = 15
    expect(gameStore.state.fieldClearedBanner!.bonus).toBe(15)
  })

  it('field clear on throw 2 sets banner and advances turn', () => {
    freshGame()
    recordPlayerThrow(0, 0) // throw 1: nothing (40 akat remain)
    recordPlayerThrow(40, 0) // throw 2: clear
    expect(gameStore.state.fieldClearedBanner).not.toBeNull()
    expect(gameStore.state.playerThrowIndex).toBe(0)
    expect(gameStore.state.turnIndex).toBe(1)
  })

  it('skips team A remaining turns after field cleared', () => {
    freshGame()
    recordClearingTurn() // turn 0: A clears → turns 2, 4, 6 skipped
    expect(gameStore.state.turnIndex).toBe(1) // next is team B turn
    recordNeutralTeamTurn() // turn 1: B
    expect(gameStore.state.turnIndex).toBe(3) // turn 2 (A) skipped
    recordNeutralTeamTurn() // turn 3: B
    expect(gameStore.state.turnIndex).toBe(5) // turn 4 (A) skipped
    recordNeutralTeamTurn() // turn 5: B
    expect(gameStore.state.turnIndex).toBe(7) // turn 6 (A) skipped
    recordNeutralTeamTurn() // turn 7: B → round complete
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('round ends immediately when both teams have cleared', () => {
    freshGame()
    recordClearingTurn() // turn 0: A clears
    recordClearingTurn() // turn 1: B clears → both cleared, round over
    expect(gameStore.state.phase).toBe('halftime')
  })

  it('normal play unaffected when no field is cleared', () => {
    freshGame()
    recordPlayerThrow(0, 0)
    expect(gameStore.state.fieldClearedBanner).toBeNull()
    recordPlayerThrow(0, 0)
    expect(gameStore.state.fieldClearedBanner).toBeNull()
  })
})

// ── Issue 6 / Issue 14: editTurn ──────────────────────────────────────────────

describe('editTurn', () => {
  it('overwrites a stored turn with new throws', () => {
    freshGame()
    recordNeutralTeamTurn() // turn 0: team A
    // Edit: throw1={ko:0,pc:0}, throw2={ko:35,pc:2} → akat=40-35-2=3, papit=2
    editTurn(0, 0, 0, { knockedOut: 0, pappiCount: 0 }, { knockedOut: 35, pappiCount: 2 })
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws[0]).toEqual({ knockedOut: 0, pappiCount: 0 })
    expect(turn.throws[1]).toEqual({ knockedOut: 35, pappiCount: 2 })
    const akat = deriveAkat(Array.from(turn.throws))
    expect(akat).toBe(3)
  })

  it('does not change phase or turnIndex', () => {
    freshGame()
    recordNeutralTeamTurn()
    const ti = gameStore.state.turnIndex
    editTurn(0, 0, 0, { knockedOut: 0, pappiCount: 0 }, { knockedOut: 35, pappiCount: 2 })
    expect(gameStore.state.turnIndex).toBe(ti)
    expect(gameStore.state.phase).toBe('round')
  })

  it('recalculates cleared flag after edit removes field-clear', () => {
    freshGame()
    recordClearingTurn() // A clears on turn 0
    expect(gameStore.state.rounds[0]!.teamACleared).toBe(true)
    editTurn(0, 0, 0, { knockedOut: 0, pappiCount: 0 }, { knockedOut: 5, pappiCount: 1 })
    expect(gameStore.state.rounds[0]!.teamACleared).toBe(false)
  })

  it('recalculates scores correctly after edit', () => {
    freshGame()
    for(let i = 0; i < 16; i++) recordNeutralTeamTurn() // all neutral → halftime
    // Edit team A turn 3 (teamTurnIndex=3): preceding 3 turns all {ko:0, pc:0}
    // throw2={ko:37,pc:1} → akat=40-37-1=2, score=2*(-2)+1*(-1)=-5
    editTurn(0, 0, 3, { knockedOut: 0, pappiCount: 0 }, { knockedOut: 37, pappiCount: 1 })
    const round = gameStore.state.rounds[0]!
    const score = getRoundScore(round, 0)
    expect(score).toBe(-5) // 2*(-2)+1*(-1)
  })

  it('field clear on throw 1 truncates to single throw and sets cleared flag', () => {
    freshGame()
    recordNeutralTeamTurn() // turn 0: A
    editTurn(0, 0, 0, { knockedOut: 40, pappiCount: 0 }) // edit to clear on throw 1
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws).toHaveLength(1)
    expect(turn.result.fieldCleared).toBe(true)
    expect(gameStore.state.rounds[0]!.teamACleared).toBe(true)
  })
})

// ── Issue 14: editPlayerThrow ─────────────────────────────────────────────────

describe('editPlayerThrow', () => {
  it('edits throw 2 and recomputes result', () => {
    freshGame()
    recordPlayerThrow(0, 0) // throw 1
    recordPlayerThrow(0, 0) // throw 2
    // Edit throw 2: ko=37, pc=1 → akat=40-37-1=2, score=-5
    editPlayerThrow(0, 0, 0, 1, 37, 1)
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws[1]).toEqual({ knockedOut: 37, pappiCount: 1 })
    expect(turn.result.points).toBe(-5) // 2*(-2)+1*(-1)
  })

  it('edits throw 1 without clearing: keeps throw 2 and recomputes', () => {
    freshGame()
    recordPlayerThrow(5, 0) // throw 1
    recordPlayerThrow(3, 1) // throw 2
    editPlayerThrow(0, 0, 0, 0, 10, 0) // change throw 1 to ko=10
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws[0]).toEqual({ knockedOut: 10, pappiCount: 0 })
    expect(turn.throws).toHaveLength(2) // throw 2 preserved
    // akat after throw2 = 40-10-3-1 = 26, score = 26*(-2)+1*(-1) = -53
    expect(turn.result.points).toBe(26 * -2 + 1 * -1)
  })

  it('editing throw 1 to trigger field-clear discards throw 2', () => {
    freshGame()
    recordPlayerThrow(0, 0) // throw 1
    recordPlayerThrow(0, 0) // throw 2
    editPlayerThrow(0, 0, 0, 0, 40, 0) // edit throw 1 to clear field
    const turn = gameStore.state.rounds[0]!.teamATurns[0]
    expect(turn.throws).toHaveLength(1)
    expect(turn.result.fieldCleared).toBe(true)
    expect(gameStore.state.rounds[0]!.teamACleared).toBe(true)
  })

  it('does not change turnIndex or phase', () => {
    freshGame()
    recordNeutralTeamTurn()
    const ti = gameStore.state.turnIndex
    editPlayerThrow(0, 0, 0, 1, 5, 0)
    expect(gameStore.state.turnIndex).toBe(ti)
    expect(gameStore.state.phase).toBe('round')
  })
})

// ── Issue 7: overrideRoundScore ───────────────────────────────────────────────

describe('overrideRoundScore', () => {
  it('stores the override value for the team', () => {
    freshGame()
    for(let i = 0; i < 4; i++) recordNeutralTeamTurn()
    overrideRoundScore(0, -3)
    expect(gameStore.state.rounds[0]!.teamAOverride).toBe(-3)
  })

  it('override value is used in getRoundScore', () => {
    freshGame()
    recordNeutralTeamTurn() // team A: would be -80
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
    for(let i = 0; i < 16; i++) recordNeutralTeamTurn()
  }

  it('transitions from halftime to round', () => {
    reachHalftime()
    expect(gameStore.state.phase).toBe('halftime')
    confirmHalftime(['Alice', 'Bob', 'Carol', 'Dave'], ['Eve', 'Frank', 'Grace', 'Hank'])
    expect(gameStore.state.phase).toBe('round')
  })

  it('sets roundIndex to 1, turnIndex to 0, and playerThrowIndex to 0', () => {
    reachHalftime()
    confirmHalftime(['A', 'B'], ['C', 'D'])
    expect(gameStore.state.roundIndex).toBe(1)
    expect(gameStore.state.turnIndex).toBe(0)
    expect(gameStore.state.playerThrowIndex).toBe(0)
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

    for(let i = 0; i < 16; i++) recordNeutralTeamTurn()
    expect(gameStore.state.phase).toBe('halftime')

    confirmHalftime(['Alice', 'Bob', 'Carol', 'Dave'], ['Eve', 'Frank', 'Grace', 'Hank'])
    expect(gameStore.state.phase).toBe('round')
    expect(gameStore.state.roundIndex).toBe(1)

    for(let i = 0; i < 16; i++) recordNeutralTeamTurn()
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
    recordNeutralTeamTurn()
    resetGame()
    expect(gameStore.state.phase).toBe('setup')
    expect(gameStore.state.teams[0].name).toBe('')
    expect(gameStore.state.rounds[0]).toBeNull()
    expect(gameStore.state.turnIndex).toBe(0)
    expect(gameStore.state.playerThrowIndex).toBe(0)
  })
})
