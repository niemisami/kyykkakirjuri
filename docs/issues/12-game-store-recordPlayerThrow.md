# Issue 12: Game store — recordPlayerThrow

## Parent

[ADR-0004: Signed pappi delta in `pappiCount`](../adr/0004-signed-pappi-delta-in-pappiCount.md)

## What to build

Update the game state machine to track player throws as the primary unit of input, replacing `recordTurn` with `recordPlayerThrow`.

State shape change:

```ts
interface GameState {
  // ... existing fields ...
  playerThrowIndex: 0 | 1   // NEW: which throw within the current turn (0 = first, 1 = second)
}
```

`recordPlayerThrow(knockedOut: number, pappiCount: number)`:
1. Derives `akat` from the full throw history for that team in the current round.
2. Derives `papitNow` from cumulative `pappiCount` deltas in that team's throw history for the round, then calls `scorePlayerThrow(akat, papitNow, teamTurnIndex + 1, TURNS_PER_ROUND, playerThrowIndex + 1)`.
3. Appends the `PlayerThrowRecord` to the in-progress turn.
4. If `fieldCleared` after throw 1: sets `fieldClearedBanner`, marks team cleared, skips player 2's throw (advance `playerThrowIndex` past 1 and move to the next turn).
5. After throw 2 (or a mid-turn field clear): finalises the `TurnRecord`, advances `turnIndex` / phase as before.
6. `playerThrowIndex` resets to `0` on each new turn.

`recordTurn` is removed. All store tests are updated to call `recordPlayerThrow` twice per turn (or once when a mid-turn field clear occurs).

## Acceptance criteria

- [x] `playerThrowIndex: 0 | 1` present in `GameState`
- [x] `recordPlayerThrow` action exported; `recordTurn` removed
- [x] Field clear on throw 1 skips throw 2, sets banner, and advances to next turn
- [x] Field clear on throw 2 behaves identically to the old per-turn clear behaviour
- [x] `turnIndex` and `phase` advance correctly after both throws are recorded
- [x] All store tests updated and passing
- [x] `playerThrowIndex` resets to 0 at the start of each new turn and after halftime

## Blocked by

- Issue 10: Scoring engine — scorePlayerThrow
- Issue 11: PlayerThrowRecord model + PlayerThrowInputSchema
