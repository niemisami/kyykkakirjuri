# Issue 14: Edit player throw + edit turn

## Parent

[ADR-0002: Player-throw input model](../adr/0002-player-throw-input-model.md)

## What to build

Extend the history panel's editing capability to match the new throws-based model. Two editing modes are supported:

**Individual throw edit** (`editPlayerThrow`): The referee taps "Muokkaa" on a specific player throw row and corrects `knockedOut` and `pappiCount` for that throw only. The store recomputes `akat` (derived from updated throw history) and recalculates the `TurnResult` for that throw and the `fieldCleared` flag for the round.

**Full turn edit** (`editTurn`): The referee taps a turn-level edit, which presents both player throw inputs pre-filled. Saving replaces both throws and recomputes the `TurnResult`.

When editing throw 1 of a turn that previously did not clear the field, but the edited values now result in a field clear, the turn is truncated to 1 throw (throw 2 is discarded) and the `fieldCleared` flag is set. The inverse — removing a field clear by editing — restores the full 2-throw structure.

## Acceptance criteria

- [x] `editPlayerThrow(roundIdx, teamIndex, teamTurnIndex, playerThrowIndex, knockedOut, pappiCount)` store action exported and tested
- [x] `editTurn` updated to accept two `PlayerThrowRecord`s; store tests updated
- [x] History panel offers per-throw "Muokkaa" buttons and a turn-level edit option
- [x] Editing throw 1 to trigger a field clear discards throw 2 and sets the flag
- [x] Editing throw 1 to remove a field clear keeps/restores throw 2 (either blank or previous value)
- [x] `turnIndex` and `phase` are not changed by edits
- [x] All store tests for edit paths pass

## Blocked by

- Issue 12: Game store — recordPlayerThrow
- Issue 13: TurnStep UI — two-step throw input
