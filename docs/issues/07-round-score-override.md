# Issue 7: Round score override

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

An escape-hatch that lets the referee discard all recorded turns for a team's current round and enter a single corrected final score. Intended for recovery from a sequence of recording errors where correcting individual turns one-by-one would be impractical.

**What this slice delivers end-to-end:**

1. **Override trigger** — A clearly-labelled "Korjaa erätulos" button in the TurnStep, visually distinct from the primary flow to signal it is a correction tool.
2. **Override input** — A numeric input for the manual score (integer; positive values are valid for the field-cleared scenario). `RoundOverrideSchema` (Zod) validates the input.
3. **Store: overrideRoundScore** — `overrideRoundScore(teamIndex, points)` marks the current round for that team as overridden and stores the manual value. Subsequent `scoreRound` calls return the override value directly.
4. **Score refresh** — The scoreboard and game total update immediately after the override is confirmed.
5. **Override indicator** — The history panel for that team shows a visual marker that the round score was manually overridden.

## Acceptance criteria

- [ ] Override button is visible but clearly secondary in the UI
- [ ] Entering a valid integer and confirming updates the team's round score
- [ ] Positive integers are accepted (field-cleared override scenario)
- [ ] The scoreboard and game total reflect the overridden value immediately
- [ ] An override indicator appears in the history panel
- [ ] `RoundOverrideSchema` Vitest tests pass
- [ ] Store `overrideRoundScore` tests verify the override value is used in score calculations

## Blocked by

- Issue 4: Turn recording — basic flow
