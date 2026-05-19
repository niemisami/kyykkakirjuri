# Issue 2: Scoring engine + tests

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

A pure, framework-free scoring module that encapsulates all kyykkä scoring rules. No side effects, no React, no store — just functions that take inputs and return outputs. This is the authoritative source for all score calculations in the app.

**Functions to implement:**

- `scoreTurn(akkat, papit, turnIndex, totalTurns)` → `{ points, fieldCleared, unusedKartut }`
  - `fieldCleared` is true when `akkat === 0 && papit === 0`
  - `unusedKartut` is the number of kartut not yet thrown when field cleared (4 kartut per remaining turn)
  - `points` is `(akkat × AKKA_POINTS) + (papit × PAPPI_POINTS)` unless `fieldCleared`, in which case `points = +unusedKartut`

- `scoreRound(turns)` → `{ points, fieldCleared }`
  - Scans turn results in order; if any entry has `fieldCleared = true`, the round score is that entry's `unusedKartut` as a positive integer
  - Otherwise uses the final entry's akkat and papit for the penalty calculation
  - If the round has a manual override value, that value is returned directly

- `scoreGame(round1, round2)` → `{ teamA: number, teamB: number, winner: 'teamA' | 'teamB' | 'tie' }`
  - Sums round scores per team; winner has the **higher** (least negative) total

**Constants:** `AKKA_POINTS = -2`, `PAPPI_POINTS = -1`, `KARTUT_PER_TURN = 4`, `TURNS_PER_ROUND = 4`

Exhaustive Vitest unit tests covering:
- Normal round: akkat and papit multiplied by correct weights and summed
- Field-cleared bonus: clearing on turn 3 of 4 yields +4 (4 unused kartut)
- Field-cleared bonus: clearing on turn 1 of 4 yields +12
- Round override: manual value supersedes calculated value
- Game totals: round 1 + round 2 summed correctly for both teams
- Winner: team with higher total wins; equal totals → tie
- Edge cases: 40 akkat + 0 papit, 0 akkat + 40 papit, 20 + 20, all zeroes

## Acceptance criteria

- [ ] `scoreTurn` returns correct points for normal scoring
- [ ] `scoreTurn` detects field cleared and returns correct `unusedKartut`
- [ ] `scoreRound` applies field-cleared logic at the correct turn
- [ ] `scoreRound` returns the manual override value when one is set
- [ ] `scoreGame` sums both rounds per team and identifies the winner
- [ ] `scoreGame` returns `'tie'` when totals are equal
- [ ] All Vitest tests pass with `pnpm test`
- [ ] Module has zero imports from React, @tanstack/store, or any UI layer

## Blocked by

- Issue 1: Project scaffold
