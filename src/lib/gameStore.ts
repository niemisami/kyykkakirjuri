import { Store } from '@tanstack/store'
import { scoreTurn, scoreRound, TURNS_PER_ROUND } from './scoring'
import type { TurnResult } from './scoring'
import { typedStorage, v1Key } from './storage/storageHelpers'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Phase = 'setup' | 'round' | 'halftime' | 'finished'

export interface Team {
  name: string
  players: string[]
}

export interface TurnRecord {
  akat: number
  papit: number
  result: TurnResult
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
  teamBCleared: boolean,
): number | null {
  let next = currentTurnIndex + 1
  while (next < 8) {
    const nextTeam = next % 2 // 0=A, 1=B
    if (nextTeam === 0 && teamACleared) {
      next++
    } else if (nextTeam === 1 && teamBCleared) {
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
  if (!round) return 0
  const turns = teamIndex === 0 ? round.teamATurns : round.teamBTurns
  const override = teamIndex === 0 ? round.teamAOverride : round.teamBOverride
  return scoreRound(
    turns.map((t) => t.result),
    override,
  ).points
}

// ── Actions ───────────────────────────────────────────────────────────────────

/** Issue 3: Validate setup and start a game. */
export function startGame(
  teamAName: string,
  teamAPlayers: string[],
  teamBName: string,
  teamBPlayers: string[],
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
    fieldClearedBanner: null,
  }))
}

/** Issue 4+5: Record a turn, detect field-cleared, advance turn index. */
export function recordTurn(akat: number, papit: number) {
  gameStore.setState((state) => {
    const { roundIndex, turnIndex, rounds, teams } = state
    const round = rounds[roundIndex] ?? emptyRound()

    const activeTeamIndex = getActiveTeamIndex(turnIndex)
    const teamTurnIndex = getTeamTurnIndex(turnIndex)

    // scoreTurn uses 1-based turnIndex
    const result = scoreTurn(akat, papit, teamTurnIndex + 1, TURNS_PER_ROUND)
    const record: TurnRecord = { akat, papit, result }

    const newRound: RoundData = { ...round }
    if (activeTeamIndex === 0) {
      newRound.teamATurns = [...newRound.teamATurns, record]
      if (result.fieldCleared) newRound.teamACleared = true
    } else {
      newRound.teamBTurns = [...newRound.teamBTurns, record]
      if (result.fieldCleared) newRound.teamBCleared = true
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

    const nextTurnIndex = getNextTurnIndex(
      turnIndex,
      newRound.teamACleared,
      newRound.teamBCleared,
    )

    if (nextTurnIndex === null) {
      // Round complete
      const nextPhase: Phase = roundIndex === 0 ? 'halftime' : 'finished'
      return {
        ...state,
        rounds: newRounds,
        turnIndex: 0,
        fieldClearedBanner,
        phase: nextPhase,
      }
    }

    return {
      ...state,
      rounds: newRounds,
      turnIndex: nextTurnIndex,
      fieldClearedBanner,
    }
  })
}

/** Issue 6: Overwrite a previously recorded turn and recalculate cleared flags. */
export function editTurn(
  roundIdx: 0 | 1,
  teamIndex: 0 | 1,
  teamTurnIndex: number,
  akat: number,
  papit: number,
) {
  gameStore.setState((state) => {
    const round = state.rounds[roundIdx]
    if (!round) return state

    const result = scoreTurn(akat, papit, teamTurnIndex + 1, TURNS_PER_ROUND)
    const record: TurnRecord = { akat, papit, result }

    const newRound: RoundData = { ...round }
    if (teamIndex === 0) {
      const turns = [...newRound.teamATurns]
      turns[teamTurnIndex] = record
      newRound.teamATurns = turns
      newRound.teamACleared = turns.some((t) => t.result.fieldCleared)
    } else {
      const turns = [...newRound.teamBTurns]
      turns[teamTurnIndex] = record
      newRound.teamBTurns = turns
      newRound.teamBCleared = turns.some((t) => t.result.fieldCleared)
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
    if (!round) return state

    const newRound: RoundData = { ...round }
    if (teamIndex === 0) {
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
  gameStore.setState((state) => ({
    ...state,
    phase: 'round',
    roundIndex: 1,
    turnIndex: 0,
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
  gameStore.setState((state) => ({ ...state, fieldClearedBanner: null }))
}
