# Issue 9: Round 2 + final results + reset

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

Complete the full game loop: round 2 plays out using the same TurnStep flow, then the app automatically transitions to a results screen showing the complete score breakdown and the winner. The referee can reset the app for a new game without a page reload.

**What this slice delivers end-to-end:**

1. **Round 2 flow** — TurnStep reuses the existing recording flow for round 2 (roundIndex 1). The active round number is visible in the UI (e.g. "Erä 2") so the referee always knows where they are.
2. **Auto-transition to results** — After the last turn of round 2, the store transitions to `finished` and the ResultsStep mounts automatically.
3. **ResultsStep UI** — Shows:
   - Each team's round 1 score, round 2 score, and total game score
   - A clear winner declaration in Finnish ("Team A voittaa!" / "Tasapeli")
   - The per-turn akat/papit breakdown for both rounds so a scorekeeper can verify the calculation
4. **Store: resetGame** — `resetGame()` transitions state back to `setup` and clears all game data. Triggered by a "Uusi peli" button on the results screen.
5. **Full state machine tests** — Vitest tests verify the complete path: `setup → round(0) → halftime → round(1) → finished → setup`.

## Acceptance criteria

- [x] Round 2 uses the same TurnStep with a visible "Erä 2" label
- [x] Edit turn, round override, and field-cleared (Issues 5-7) work in round 2 as in round 1
- [x] After the last turn of round 2 the app automatically shows the results screen
- [x] Results screen shows round 1 score, round 2 score, and total for each team
- [x] Winner (or tie) is declared clearly in Finnish
- [x] Per-turn akat/papit breakdown is visible for both rounds
- [x] "Uusi peli" button resets to the setup step without a page reload
- [x] All game data is cleared after reset — the setup step is blank
- [x] Full state machine Vitest tests pass (`setup → round → halftime → round → finished → setup`)

## Blocked by

- Issue 8: Halftime + player substitutions
