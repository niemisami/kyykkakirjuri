export const AKKA_POINTS = -2 as const
export const PAPPI_POINTS = -1 as const
export const KARTUT_PER_TURN = 4 as const
export const TURNS_PER_ROUND = 4 as const

export interface TurnResult {
  points: number
  fieldCleared: boolean
  unusedKartut: number
}

export interface RoundResult {
  points: number
  fieldCleared: boolean
}

export interface GameResult {
  teamA: number
  teamB: number
  winner: 'teamA' | 'teamB' | 'tie'
}

/**
 * Scores a single heittovuoro.
 * @param akkat   Kyykät remaining inside the target square
 * @param papit   Kyykät resting on the boundary line
 * @param turnIndex   1-based index of the current turn within the round
 * @param totalTurns  Total turns in the round (normally TURNS_PER_ROUND = 4)
 */
export function scoreTurn(
  akkat: number,
  papit: number,
  turnIndex: number,
  totalTurns: number,
): TurnResult {
  const fieldCleared = akkat === 0 && papit === 0
  if (fieldCleared) {
    const unusedKartut = (totalTurns - turnIndex) * KARTUT_PER_TURN
    return { points: unusedKartut, fieldCleared: true, unusedKartut }
  }
  return {
    points: akkat * AKKA_POINTS + papit * PAPPI_POINTS,
    fieldCleared: false,
    unusedKartut: 0,
  }
}

/**
 * Scores a complete erä (round) for one team.
 * @param turns     Ordered array of TurnResults for the round
 * @param override  Optional manual override — returned directly when provided
 */
export function scoreRound(turns: TurnResult[], override?: number): RoundResult {
  if (override !== undefined) {
    return { points: override, fieldCleared: false }
  }

  for (const turn of turns) {
    if (turn.fieldCleared) {
      return { points: turn.unusedKartut, fieldCleared: true }
    }
  }

  const lastTurn = turns[turns.length - 1]
  return { points: lastTurn?.points ?? 0, fieldCleared: false }
}

/**
 * Scores a complete peli (game) across two rounds.
 * @param round1  Round 1 scores { teamA, teamB }
 * @param round2  Round 2 scores { teamA, teamB }
 */
export function scoreGame(
  round1: { teamA: number; teamB: number },
  round2: { teamA: number; teamB: number },
): GameResult {
  const teamA = round1.teamA + round2.teamA
  const teamB = round1.teamB + round2.teamB
  const winner: GameResult['winner'] =
    teamA > teamB ? 'teamA' : teamB > teamA ? 'teamB' : 'tie'
  return { teamA, teamB, winner }
}
