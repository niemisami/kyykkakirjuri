# Issue 10: Scoring engine — scorePlayerThrow

## Parent

[ADR-0004: Signed pappi delta in `pappiCount`](../adr/0004-signed-pappi-delta-in-pappiCount.md)

## What to build

Rename `scoreTurn` → `scorePlayerThrow` and add a `throwIndexWithinTurn: 1 | 2` parameter so the scoring engine can compute the correct unused-kartut bonus when the field is cleared mid-turn.

With the new signature, if a team clears the field on player throw 1 (the first of the two player throws within a turn), the 2 unthrown kartut belonging to player 2 are added to the unused count on top of the remaining full turns. Previously `scoreTurn` only accounted for full unused turns; it had no concept of a mid-turn clear.

The type shape (from design):

```ts
// throwIndexWithinTurn: 1 = first player throw, 2 = second player throw
function scorePlayerThrow(
  akat: number,
  papit: number,
  turnIndex: number,       // 1-based turn within the round
  totalTurns: number,
  throwIndexWithinTurn: 1 | 2,
): TurnResult
```

When `fieldCleared` and `throwIndexWithinTurn === 1`:
`unusedKartut = 2 + (totalTurns - turnIndex) * KARTUT_PER_TURN`

When `fieldCleared` and `throwIndexWithinTurn === 2`:
`unusedKartut = (totalTurns - turnIndex) * KARTUT_PER_TURN` (unchanged from current logic)

All callers of the old `scoreTurn` must be updated to pass `throwIndexWithinTurn`.

## Acceptance criteria

- [x] `scorePlayerThrow` exported; `scoreTurn` removed
- [x] Mid-turn field clear on throw 1 yields `unusedKartut = 2 + remainingFullTurns × 4`
- [x] Field clear on throw 2 yields the same result as the old `scoreTurn` formula
- [x] All existing scoring tests updated and passing
- [x] New tests cover the `throwIndexWithinTurn: 1` mid-turn bonus case
- [x] `scoreRound` and `scoreGame` continue to work correctly with updated results

## Blocked by

None — can start immediately.
