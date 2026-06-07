/**
 * Returns the pair of players throwing at a given turnIndex (0-based, 0-3).
 * Pairs: turns 0 & 2 → players[0] + players[1]
 *        turns 1 & 3 → players[2] + players[3]
 * Degrades gracefully for teams with fewer than 4 players (indices wrap around).
 */
export function getPlayerPair<T>(players: T[], turnIndex: number): [T, T] {
  const n = players.length
  if(turnIndex === 0 || turnIndex === 2) {
    return [players[0 % n], players[1 % n]]
  }
  return [players[2 % n], players[3 % n]]
}
