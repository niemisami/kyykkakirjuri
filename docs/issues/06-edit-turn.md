# Issue 6: Edit turn

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

The referee can open any previously recorded turn in the current round, correct the akat or papit count, and see the running score recalculate immediately. This is a correction tool, not a primary input method.

**What this slice delivers end-to-end:**

1. **History panel** — The TurnStep shows a compact list of all turns recorded so far in the current round, labelled with team name and turn number.
2. **Edit in place** — Tapping a history entry opens the same akat/papit inputs pre-filled with the recorded values. The same `TurnInputSchema` validation applies.
3. **Store: editTurn** — `editTurn(roundIndex, turnIndex, teamIndex, akat, papit)` overwrites the stored result and recalculates round scores via the scoring engine.
4. **Score refresh** — After saving the edit the scoreboard and running totals update to reflect the corrected value.

## Acceptance criteria

- [x] History panel lists all confirmed turns for the current round
- [x] Tapping a history entry opens it in an editable form pre-filled with the recorded values
- [x] Validation (akat + papit ≤ 40) applies to edits
- [x] Saving an edit overwrites the stored result
- [x] Running round scores recalculate correctly after the edit
- [x] Cancelling an edit leaves the original value unchanged
- [x] Store `editTurn` Vitest tests pass

## Blocked by

- Issue 4: Turn recording — basic flow
