# Issue 3: Game setup step

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

The first step in the single-screen stepper: the referee enters both team names and their players before the game begins. Completing setup transitions the app to the first turn of round 1.

**What this slice delivers end-to-end:**

1. **SetupStep UI** — Two sections (one per team): a text input for the team name and 1–4 text inputs for player names. The referee can add and remove players. All labels in Finnish.
2. **Validation** — `GameSetupSchema` (Zod): team names must be non-empty; each team needs 1–4 players with non-empty names. Inline error messages in Finnish.
3. **Player pairing module** — Given an ordered player list and a turn index (0–3), returns the two players throwing that turn: indices 0+1 for turns 0 and 2, indices 2+3 for turns 1 and 3. For teams with fewer than 4 players the pairing degrades gracefully (players repeat). Vitest unit tests cover all team sizes (1–4 players) and all turn indices.
4. **Store: setup phase** — `startGame(teamA, teamB)` validates setup and transitions state from `setup` to `round` (roundIndex: 0, turnIndex: 0).

Mobile-friendly layout: large touch targets, no horizontal scrolling.

## Acceptance criteria

- [ ] Referee can enter two team names
- [ ] Referee can add 1–4 players per team
- [ ] Validation prevents submission with empty team names or zero players
- [ ] Inline validation errors display in Finnish
- [ ] Confirming valid setup transitions to the turn recording step
- [ ] Player pairing module returns correct pairs for all team sizes (1–4) and all turn indices (0–3)
- [ ] Player pairing Vitest tests pass
- [ ] `GameSetupSchema` Vitest tests pass (valid and invalid inputs)
- [ ] Store transitions correctly from `setup` → `round` on `startGame`

## Blocked by

- Issue 1: Project scaffold
