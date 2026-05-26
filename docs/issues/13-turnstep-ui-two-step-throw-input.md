# Issue 13: TurnStep UI — two-step throw input

## Parent

[ADR-0004: Signed pappi delta in `pappiCount`](../adr/0004-signed-pappi-delta-in-pappiCount.md)

## What to build

Update `TurnStep` so that `RecordForm` guides the referee through two sequential player throws per turn instead of a single combined akat/papit input.

The form shows which individual player is currently throwing (not just the pair), and the two input fields are `knockedOut` (Poistot) and `pappiCount` (Papit). `pappiCount` is a signed pappi delta (positive = papit created, negative = pappi struck back inside). After each submission the store advances `playerThrowIndex`; the form resets and shows the second player's name.

A live derived line replaces the current "Tyhjennetty" counter, showing `akat = 40 − ΣknockedOut − ΣpappiCount` computed from the current round's throw history so the referee can sanity-check the count before confirming.

The history panel adapts to display per-throw data: each turn row expands to show both throws with their `knockedOut` and `pappiCount` values. The existing `fieldClearedBanner` and round-info header require no changes.

## Acceptance criteria

- [x] `RecordForm` shows which individual player is throwing (player 1 or player 2 of the pair)
- [x] Input fields are labelled "Poistot" and "Papit" (Finnish); live-derived akat displayed
- [x] Submitting throw 1 advances to throw 2 within the same turn without changing the outer layout
- [x] Submitting throw 2 finalises the turn and advances to the next team's turn
- [x] Mid-turn field clear (after throw 1) skips throw 2 and shows the field-cleared banner
- [x] History panel shows `knockedOut` and `pappiCount` per throw
- [x] `PlayerThrowInputSchema` validation errors surface in the form
- [x] Existing override and full-turn edit flows continue to work

## Blocked by

- Issue 12: Game store — recordPlayerThrow
