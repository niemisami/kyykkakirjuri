# Issue 4: Turn recording — basic flow

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

The core live-scoring loop: the referee records akkat and papit after each turn, sees the running score update, and the app auto-advances through all 8 turns of round 1 (4 per team, alternating). This slice covers the happy path only — no field-cleared bonus, no edit, no override.

**What this slice delivers end-to-end:**

1. **TurnStep UI** — Shows the active team name and the two players throwing (from the player pairing module). Two large numeric inputs for akkat and papit with +/− stepper buttons suited to one-handed mobile use. A "Vahvista" button advances to the next turn. A persistent scoreboard header shows running totals for both teams.
2. **Validation** — `TurnInputSchema` (Zod): akkat ∈ [0, 40], papit ∈ [0, 40], akkat + papit ≤ 40. Inline Finnish error if exceeded.
3. **Cleared count** — Automatically displayed as `40 − akkat − papit` so the referee can cross-check against the field.
4. **Progress indicator** — Shows how many turns remain in the current round for each team.
5. **Store: round phase** — `recordTurn(akkat, papit)` appends the result for the active team, advances the turn index, and auto-transitions to `halftime` after the 8th turn.
6. **Running score** — Calls `scoreRound` from the scoring engine after each entry to display live round scores.

## Acceptance criteria

- [x] Active team name and throwing player pair are displayed for each turn
- [x] Akkat and papit inputs reject values where akkat + papit > 40 with a Finnish error message
- [x] Cleared count (`40 − akkat − papit`) updates live as values change
- [x] Confirming a turn advances to the next team's turn
- [x] Teams alternate correctly: Team A → Team B → Team A → … for 8 total turns
- [x] Running round scores for both teams update after each confirmed turn
- [x] Progress indicator reflects remaining turns in the round
- [x] After the 8th turn the store transitions to the `halftime` phase
- [x] `TurnInputSchema` Vitest tests pass
- [x] Store transition tests pass (8-turn flow through to halftime)

## Blocked by

- Issue 2: Scoring engine
- Issue 3: Game setup step
