import { Store } from '@tanstack/store'
import { scorePlayerThrow, scoreRound, TURNS_PER_ROUND } from './scoring'
import type { TurnResult } from './scoring'
import { deriveAkat } from './schemas'
import type { PlayerThrowRecord } from './schemas'
import { typedStorage, v1Key } from './storage/storageHelpers'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Phase = 'setup' | 'round' | 'halftime' | 'finished'

export interface Team {
  name: string
  players: string[]
}

export interface TurnRecord {
  throws: [PlayerThrowRecord] | [PlayerThrowRecord, PlayerThrowRecord]
  result: TurnResult // reflects state at the final throw of the turn
}

export interface RoundData {
  teamATurns: TurnRecord[]
  teamBTurns: TurnRecord[]
  teamACleared: boolean
  teamBCleared: boolean
  teamAOverride: number | undefined
  teamBOverride: number | undefined
}

export interface FieldClearedBanner {
  teamIndex: 0 | 1
  teamName: string
  bonus: number
}

export interface GameState {
  phase: Phase
  teams: [Team, Team]
  /** rounds[0] = round 1, rounds[1] = round 2 */
  rounds: [RoundData | null, RoundData | null]
  roundIndex: 0 | 1
  /** 0–7: position in the current round (even = team A, odd = team B) */
  turnIndex: number
  /** 0 = first player throw of the current turn, 1 = second player throw */
  playerThrowIndex: 0 | 1
  fieldClearedBanner: FieldClearedBanner | null
}

// ── Initial state ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'game-state'

const initialState: GameState = {
  phase: 'setup',
  teams: [
    { name: '', players: [] },
    { name: '', players: [] },
  ],
  rounds: [null, null],
  roundIndex: 0,
  turnIndex: 0,
  playerThrowIndex: 0,
  fieldClearedBanner: null,
}

const gameStateStorage = typedStorage<GameState>(localStorage, v1Key(STORAGE_KEY), initialState)

export const gameStore = new Store<GameState>(gameStateStorage.getData())
gameStore.subscribe(() => gameStateStorage.persistData(gameStore.state))

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyRound(): RoundData {
  return {
    teamATurns: [],
    teamBTurns: [],
    teamACleared: false,
    teamBCleared: false,
    teamAOverride: undefined,
    teamBOverride: undefined,
  }
}

/**
 * Returns the next valid turn index (0–7) after `currentTurnIndex`,
 * skipping turns for teams that have already cleared the field.
 * Returns null when the round is complete.
 */
export function getNextTurnIndex(
  currentTurnIndex: number,
  teamACleared: boolean,
  teamBCleared: boolean
): number | null {
  let next = currentTurnIndex + 1
  while(next < 8) {
    const nextTeam = next % 2 // 0=A, 1=B
    if(nextTeam === 0 && teamACleared) {
      next++
    } else if(nextTeam === 1 && teamBCleared) {
      next++
    } else {
      return next
    }
  }
  return null
}

/** Index of the team whose turn it is (0 = team A, 1 = team B). */
export function getActiveTeamIndex(turnIndex: number): 0 | 1 {
  return (turnIndex % 2) as 0 | 1
}

/** 0-based turn index within that team's 4-turn sequence. */
export function getTeamTurnIndex(turnIndex: number): number {
  return Math.floor(turnIndex / 2)
}

/** Round score for a team from a RoundData object. */
export function getRoundScore(round: RoundData | null, teamIndex: 0 | 1): number {
  if(!round) return 0
  const turns = teamIndex === 0 ? round.teamATurns : round.teamBTurns
  const override = teamIndex === 0 ? round.teamAOverride : round.teamBOverride
  return scoreRound(
    turns.map(t => t.result),
    override
  ).points
}

// ── Actions ───────────────────────────────────────────────────────────────────

/** Issue 3: Validate setup and start a game. */
export function startGame(
  teamAName: string,
  teamAPlayers: string[],
  teamBName: string,
  teamBPlayers: string[]
) {
  gameStore.setState(() => ({
    phase: 'round',
    teams: [
      { name: teamAName, players: teamAPlayers },
      { name: teamBName, players: teamBPlayers },
    ],
    rounds: [emptyRound(), null],
    roundIndex: 0,
    turnIndex: 0,
    playerThrowIndex: 0,
    fieldClearedBanner: null,
  }))
}

/** Issue 4+5 / Issue 12: Record a single player throw, detect field-cleared, advance state. */
export function recordPlayerThrow(knockedOut: number, pappiCount: number) {
  gameStore.setState((state) => {
    const { roundIndex, turnIndex, playerThrowIndex, rounds, teams } = state
    const round = rounds[roundIndex] ?? emptyRound()

    const activeTeamIndex = getActiveTeamIndex(turnIndex)
    const teamTurnIndex = getTeamTurnIndex(turnIndex)
    const teamTurns = activeTeamIndex === 0 ? round.teamATurns : round.teamBTurns

    // Build cumulative throw history for akat derivation
    const precedingThrows = teamTurns.flatMap(t => Array.from(t.throws))
    const currentThrow: PlayerThrowRecord = { knockedOut, pappiCount }
    const allThrows = [...precedingThrows, currentThrow]

    const akat = deriveAkat(allThrows)
    const throwIndexWithinTurn = (playerThrowIndex + 1) as 1 | 2
    const result = scorePlayerThrow(akat, pappiCount, teamTurnIndex + 1, TURNS_PER_ROUND, throwIndexWithinTurn)

    const newRound: RoundData = { ...round }

    if(playerThrowIndex === 0) {
      // First player throw: push a new TurnRecord with one throw
      const newRecord: TurnRecord = { throws: [currentThrow], result }
      if(activeTeamIndex === 0) {
        newRound.teamATurns = [...newRound.teamATurns, newRecord]
        if(result.fieldCleared) newRound.teamACleared = true
      } else {
        newRound.teamBTurns = [...newRound.teamBTurns, newRecord]
        if(result.fieldCleared) newRound.teamBCleared = true
      }
    } else {
      // Second player throw: update the last TurnRecord with the second throw
      const turns = activeTeamIndex === 0 ? newRound.teamATurns : newRound.teamBTurns
      const prevRecord = turns[turns.length - 1]
      const updatedRecord: TurnRecord = { throws: [prevRecord.throws[0], currentThrow], result }
      const newTurns = [...turns.slice(0, -1), updatedRecord]
      if(activeTeamIndex === 0) {
        newRound.teamATurns = newTurns
        if(result.fieldCleared) newRound.teamACleared = true
      } else {
        newRound.teamBTurns = newTurns
        if(result.fieldCleared) newRound.teamBCleared = true
      }
    }

    const newRounds: [RoundData | null, RoundData | null] = [
      roundIndex === 0 ? newRound : rounds[0],
      roundIndex === 1 ? newRound : rounds[1],
    ]

    const fieldClearedBanner: FieldClearedBanner | null = result.fieldCleared
      ? {
        teamIndex: activeTeamIndex,
        teamName: teams[activeTeamIndex].name,
        bonus: result.unusedKartut,
      }
      : null

    // After throw 1 without a clear: stay on the same turn, advance to throw 2
    if(playerThrowIndex === 0 && !result.fieldCleared) {
      return { ...state, rounds: newRounds, playerThrowIndex: 1, fieldClearedBanner: null }
    }

    // After throw 2 or a mid-turn field clear: finalise turn and advance
    const nextTurnIndex = getNextTurnIndex(
      turnIndex,
      newRound.teamACleared,
      newRound.teamBCleared
    )

    if(nextTurnIndex === null) {
      const nextPhase: Phase = roundIndex === 0 ? 'halftime' : 'finished'
      return {
        ...state,
        rounds: newRounds,
        turnIndex: 0,
        playerThrowIndex: 0,
        fieldClearedBanner,
        phase: nextPhase,
      }
    }

    return {
      ...state,
      rounds: newRounds,
      turnIndex: nextTurnIndex,
      playerThrowIndex: 0,
      fieldClearedBanner,
    }
  })
}

/** Issue 6 / Issue 14: Overwrite a previously recorded turn with two PlayerThrowRecords. */
export function editTurn(
  roundIdx: 0 | 1,
  teamIndex: 0 | 1,
  teamTurnIndex: number,
  throw1: PlayerThrowRecord,
  throw2?: PlayerThrowRecord
) {
  gameStore.setState((state) => {
    const round = state.rounds[roundIdx]
    if(!round) return state

    const teamTurns = teamIndex === 0 ? round.teamATurns : round.teamBTurns
    const precedingThrows = teamTurns
      .slice(0, teamTurnIndex)
      .flatMap(t => Array.from(t.throws))

    const throws1History = [...precedingThrows, throw1]
    const akat1 = deriveAkat(throws1History)
    const result1 = scorePlayerThrow(akat1, throw1.pappiCount, teamTurnIndex + 1, TURNS_PER_ROUND, 1)

    let newRecord: TurnRecord
    if(result1.fieldCleared || !throw2) {
      newRecord = { throws: [throw1], result: result1 }
    } else {
      const throws2History = [...throws1History, throw2]
      const akat2 = deriveAkat(throws2History)
      const result2 = scorePlayerThrow(akat2, throw2.pappiCount, teamTurnIndex + 1, TURNS_PER_ROUND, 2)
      newRecord = { throws: [throw1, throw2], result: result2 }
    }

    const newRound: RoundData = { ...round }
    if(teamIndex === 0) {
      const turns = [...newRound.teamATurns]
      turns[teamTurnIndex] = newRecord
      newRound.teamATurns = turns
      newRound.teamACleared = turns.some(t => t.result.fieldCleared)
    } else {
      const turns = [...newRound.teamBTurns]
      turns[teamTurnIndex] = newRecord
      newRound.teamBTurns = turns
      newRound.teamBCleared = turns.some(t => t.result.fieldCleared)
    }

    const newRounds: [RoundData | null, RoundData | null] = [
      roundIdx === 0 ? newRound : state.rounds[0],
      roundIdx === 1 ? newRound : state.rounds[1],
    ]

    return { ...state, rounds: newRounds }
  })
}

/** Issue 14: Edit a single player throw within a recorded turn. */
export function editPlayerThrow(
  roundIdx: 0 | 1,
  teamIndex: 0 | 1,
  teamTurnIndex: number,
  playerThrowIndex: 0 | 1,
  knockedOut: number,
  pappiCount: number
) {
  gameStore.setState((state) => {
    const round = state.rounds[roundIdx]
    if(!round) return state

    const teamTurns = teamIndex === 0 ? round.teamATurns : round.teamBTurns
    const turnRecord = teamTurns[teamTurnIndex]
    if(!turnRecord) return state

    const editedThrow: PlayerThrowRecord = { knockedOut, pappiCount }
    const precedingThrows = teamTurns
      .slice(0, teamTurnIndex)
      .flatMap(t => Array.from(t.throws))

    let newRecord: TurnRecord

    if(playerThrowIndex === 0) {
      const throw1History = [...precedingThrows, editedThrow]
      const akat1 = deriveAkat(throw1History)
      const result1 = scorePlayerThrow(akat1, pappiCount, teamTurnIndex + 1, TURNS_PER_ROUND, 1)

      if(result1.fieldCleared) {
        // Edited throw 1 now clears: discard throw 2
        newRecord = { throws: [editedThrow], result: result1 }
      } else if(turnRecord.throws.length === 2) {
        // Keep existing throw 2 but recompute its result
        const throw2 = turnRecord.throws[1]
        const throw2History = [...throw1History, throw2]
        const akat2 = deriveAkat(throw2History)
        const result2 = scorePlayerThrow(akat2, throw2.pappiCount, teamTurnIndex + 1, TURNS_PER_ROUND, 2)
        newRecord = { throws: [editedThrow, throw2], result: result2 }
      } else {
        // Was a single-throw turn (mid-clear), now not cleared; keep as single throw
        newRecord = { throws: [editedThrow], result: result1 }
      }
    } else {
      // Editing throw 2
      const throw1 = turnRecord.throws[0]
      const throw2History = [...precedingThrows, throw1, editedThrow]
      const akat2 = deriveAkat(throw2History)
      const result2 = scorePlayerThrow(akat2, pappiCount, teamTurnIndex + 1, TURNS_PER_ROUND, 2)
      newRecord = { throws: [throw1, editedThrow], result: result2 }
    }

    const newRound: RoundData = { ...round }
    if(teamIndex === 0) {
      const turns = [...newRound.teamATurns]
      turns[teamTurnIndex] = newRecord
      newRound.teamATurns = turns
      newRound.teamACleared = turns.some(t => t.result.fieldCleared)
    } else {
      const turns = [...newRound.teamBTurns]
      turns[teamTurnIndex] = newRecord
      newRound.teamBTurns = turns
      newRound.teamBCleared = turns.some(t => t.result.fieldCleared)
    }

    const newRounds: [RoundData | null, RoundData | null] = [
      roundIdx === 0 ? newRound : state.rounds[0],
      roundIdx === 1 ? newRound : state.rounds[1],
    ]

    return { ...state, rounds: newRounds }
  })
}

/** Issue 7: Set a manual score override for a team's current round. */
export function overrideRoundScore(teamIndex: 0 | 1, points: number) {
  gameStore.setState((state) => {
    const { roundIndex, rounds } = state
    const round = rounds[roundIndex]
    if(!round) return state

    const newRound: RoundData = { ...round }
    if(teamIndex === 0) {
      newRound.teamAOverride = points
    } else {
      newRound.teamBOverride = points
    }

    const newRounds: [RoundData | null, RoundData | null] = [
      roundIndex === 0 ? newRound : rounds[0],
      roundIndex === 1 ? newRound : rounds[1],
    ]

    return { ...state, rounds: newRounds }
  })
}

/** Issue 8: Update rosters and start round 2. */
export function confirmHalftime(teamAPlayers: string[], teamBPlayers: string[]) {
  gameStore.setState(state => ({
    ...state,
    phase: 'round',
    roundIndex: 1,
    turnIndex: 0,
    playerThrowIndex: 0,
    fieldClearedBanner: null,
    teams: [
      { ...state.teams[0], players: teamAPlayers },
      { ...state.teams[1], players: teamBPlayers },
    ],
    rounds: [state.rounds[0], emptyRound()],
  }))
}

/** Issue 9: Reset everything back to the setup screen. */
export function resetGame() {
  gameStore.setState(() => ({ ...initialState }))
}

/** Dismiss the field-cleared banner without advancing state. */
export function dismissFieldClearedBanner() {
  gameStore.setState(state => ({ ...state, fieldClearedBanner: null }))
}
