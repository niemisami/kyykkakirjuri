# Issue 8: Halftime + player substitutions

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

The halftime screen shown automatically after round 1 completes. The referee sees the round 1 score summary, can make player substitutions and reorder each team's playing order, then confirms to start round 2 with sides swapped.

**What this slice delivers end-to-end:**

1. **HalftimeStep UI** — Displays each team's round 1 score (akat × -2 + papit × -1, or field-cleared bonus, or override value). Finnish heading "Erätauko".
2. **Side-swap display** — Visually indicates that teams swap sides for round 2.
3. **Substitutions** — For each team, an editable player list: the referee can replace any player name and reorder the playing order for round 2. Validation: 1-4 non-empty names per team.
4. **Store: confirmHalftime** — `confirmHalftime(teamAPlayers, teamBPlayers)` updates the player rosters and transitions state from `halftime` to `round` (roundIndex: 1, turnIndex: 0).
5. **Round 2 starts** — After confirming, the TurnStep resumes with round 2 state using the updated player rosters.

## Acceptance criteria

- [x] Halftime screen appears automatically after the 8th turn of round 1
- [x] Round 1 scores for both teams are displayed in Finnish
- [x] Side-swap is clearly communicated in the UI
- [x] Referee can edit player names and reorder playing order per team
- [x] Confirming without changes works (substitutions are optional)
- [x] After confirming, round 2 turns start with correct team and player state
- [x] Store `confirmHalftime` Vitest tests verify the transition and roster update

## Blocked by

- Issue 4: Turn recording — basic flow
