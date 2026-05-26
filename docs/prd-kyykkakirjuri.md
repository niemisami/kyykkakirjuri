# PRD: Kyykkakirjuri — Live Kyykkä Scorekeeping App

## Problem Statement

Kyykkä referees and scorekeepers currently track scores with pen and paper during live games. This is error-prone — especially under time pressure between turns — and makes it hard to get a clear running picture of the game state (who is winning, how many kyykät remain, which round we're in). Corrections require crossing things out and recalculating. There is no standard tool for the job.

## Solution

A mobile-web app that a referee opRoundtes in the field during a live kyykkä game. It guides the referee through the full game flow: setup (team names, player order) → round 1 (recording akat and papit after each turn) → halftime (optional substitutions, side swap) → round 2 → final results. Scores are calculated automatically. The referee can edit any previously recorded turn at any time if they miscounted.

The app runs entirely in the browser with no backend or persistence — one browser session equals one game.

## User Stories

1. As a referee, I want to enter both team names at the start of a game, so that the scoreboard clearly identifies which team is which throughout the game.
2. As a referee, I want to add up to 4 players per team with their names during setup, so that the app can display which players are throwing each turn.
3. As a referee, I want to set the playing order for each team during setup, so that the player pairing (1+2, 3+4) for turns is correct from the start.
4. As a referee, I want to see which two players are throwing the current turn, so that I know who to watch without consulting my notes.
5. As a referee, I want to input the current akka count after a turn, so that the app can track how many kyykät remain inside the target square.
6. As a referee, I want to input the current pappi count after a turn, so that the app can track how many kyykät are resting on the boundary.
7. As a referee, I want the app to prevent me from entering akat + papit > 40, so that I catch obvious miscounts before confirming them.
8. As a referee, I want the app to automatically calculate and display how many kyykät have been cleared after each turn, so that I can verify my count against what I see on the field.
9. As a referee, I want to confirm a turn result and advance to the next team's turn with a single action, so that the flow stays fast during play.
10. As a referee, I want to edit the most recently recorded turn, so that I can correct a miscount without abandoning the game.
11. As a referee, I want to edit any previously recorded turn within the current round, so that I can fix an error I only noticed later.
12. As a referee, I want the app to detect when a team's target square is fully cleared (akat = 0, papit = 0) before all 16 kartut are used, so that the field-cleared bonus score is applied automatically.
13. As a referee, I want to see the bonus kartut count when a team achieves field cleared, so that I can confirm the score is correct.
14. As a referee, I want to override the entire round score with a manually entered final total at any point during the round, so that I can recover from a sequence of recording errors without tediously correcting each turn individually.
15. As a referee, I want to see a live running score for both teams at all times during the game, so that I can announce the current standings at any moment.
16. As a referee, I want to see how many turns remain in the current round for each team, so that I know how close we are to halftime.
17. As a referee, I want the app to automatically transition to the halftime screen after both teams have completed their 4 turns in round 1, so that I don't have to navigate manually.
18. As a referee, I want to see the round 1 scores for both teams on the halftime screen, so that I can announce results before starting round 2.
19. As a referee, I want to make player substitutions at halftime, so that teams can swap players between erät as the rules allow.
20. As a referee, I want to update the playing order for each team at halftime, so that the correct player pairs are shown during round 2.
21. As a referee, I want to confirm side-swap and start round 2 from the halftime screen, so that the app correctly tracks which team attacks which target square in the second round.
22. As a referee, I want round 2 to follow the same turn recording flow as round 1, so that my workflow is consistent.
23. As a referee, I want the app to automatically show the final results screen after both teams complete their turns in round 2, so that I don't have to navigate manually.
24. As a referee, I want the final results screen to show each team's round 1 score, round 2 score, and total game score, so that I can announce the full result clearly.
25. As a referee, I want the final results screen to clearly indicate which team won (or if it is a tie), so that there is no ambiguity.
26. As a referee, I want to start a new game from the results screen without reloading the page, so that I can run back-to-back games in a tournament.
27. As a referee, I want the app to be fully usable on a smartphone held in one hand, so that I can keep one eye on the field at all times.
28. As a referee, I want large, finger-friendly input controls for akat and papit counts, so that I don't mis-tap under field conditions.
29. As a scorekeeper reviewing the results, I want to see the breakdown of akat and papit per turn for each team, so that I can verify the score calculation.
30. As a Finnish-speaking referee, I want the entire UI in Finnish using official kyykkä terminology, so that the app feels natural to use.
31. As an English-speaking referee, I want to switch the UI language to English, so that I can use the app without knowing Finnish.

## Implementation Decisions

### Module: Scoring engine

Pure functions with no side effects and no framework dependencies. The interface exposes:

- `scoreTurn(akat, papit, kartutUsed, totalKartut)` → `{ points, fieldCleared, unusedKartut }`
- `scoreTurn(turns)` → `{ points, fieldCleared }` — applies field-cleared logic: if any turn in the round reached akat=0 and papit=0, the round score is `+unusedKartut` for the remaining kartut at that point; otherwise `sum(akat × −2) + sum(papit × −1)` at end of round.
- `scoreGame(erä1, erä2)` → `{ teamA, teamB, winner }` — sums both erät per team and determines the winner (lower negative score, or field-cleared positive).

Penalty weights are constants: `AKKA_POINTS = -2`, `PAPPI_POINTS = -1`.

### Module: Game state machine (`@tanstack/store`)

Holds the single source of truth for the entire game. State shape (conceptual):

```
GameState =
  | { phase: 'setup' }
  | { phase: 'round', roundIndex: 0 | 1, turnIndex: number, teams: Team[], results: TurnResult[][] }
  | { phase: 'halftime', round1Results: RoundResult }
  | { phase: 'finished', gameResult: GameResult }
```

Actions exposed by the store:
- `startGame(teamA, teamB)` — validates setup and transitions `setup → round`
- `recordTurn(akat, papit)` — appends result for the active team/turn; auto-detects field cleared; auto-advances to next team or to halftime/finished
- `editTurn(roundIndex, turnIndex, teamIndex, akat, papit)` — overwrites a previously recorded result and recalculates downstream scores
- `overrideRoundScore(teamIndex, points)` — replaces calculated round score with a manually entered value; marks that round as overridden
- `confirmRoundtauko(substitutions)` — applies substitutions and transitions `halftime → round` (round 2)
- `resetGame()` — transitions any phase back to `setup` for a new game

### Module: Player pairing

Given a team's ordered player list (length 1-4) and a turn index (0-3), returns the two players throwing that turn:

- Pair A: players at index 0 and 1 (turns 0 and 2)
- Pair B: players at index 2 and 3 (turns 1 and 3)
- For teams with fewer than 4 players, pairs degrade gracefully (same player may appear in both pairs).

### Module: Validation schemas (Zod)

- `TurnInputSchema` — `{ akat: number (0-40), papit: number (-40-40) }` with a refinement: `akat + papit ≤ 40`
- `GameSetupSchema` — `{ teamAName: string (non-empty), teamBName: string (non-empty), teamAPlayers: string[] (length 1-4), teamBPlayers: string[] (length 1-4) }`
- `RoundOverrideSchema` — `{ points: number }` (integer, no bounds; allows positive for field-cleared)

### UI: Single-screen stepper

The app renders a single route. The active `phase` from the game store drives which step component is mounted:

1. **SetupStep** — team names + player name entry
2. **TurnStep** — akat/papit spinners, player pair display, live cleared-count indicator, edit history panel
3. **halftimeStep** — round 1 score summary, substitution form, confirm button
4. **ResultsStep** — full score breakdown, winner declaration, new game button

### i18n

Paraglide.js with Finnish as the default locale and English as a secondary locale. All UI strings — including official kyykkä terms (akka, pappi, turn, round, etc.) — are in the message catalog. Language toggle is accessible from all steps.

### Routing

A single route at `/`. No sub-routes for game phases — all phase transitions are driven by store state. `@tanstack/router` is included for forward-compatibility but only one route exists in the MVP.

## Testing Decisions

**What makes a good test:** Tests verify observable outputs given inputs — they do not assert on internal state shape, implementation details, or private functions. A test should read like a scenario a domain expert can verify.

### Scoring engine
All scoring logic is tested exhaustively:
- Normal round: verify that akat and papit are multiplied by the correct penalty weights and summed.
- Field-cleared bonus: verify that when akat=0 and papit=0 after turn N, the round score equals `+(16 − N×4)`.
- Game totals: verify that round 1 + round 2 scores sum correctly for both teams.
- Edge cases: all 40 kyykät remaining (maximum penalty), first turn clears everything (maximum bonus), exactly 40 akat + papit split.

### Game state machine
State transition tests:
- Setup → round transition with valid and invalid inputs.
- turn recording advances to the correct next team.
- After turn 4 of team B in round 1, state transitions to `halftime`.
- After turn 4 of team B in round 2, state transitions to `finished`.
- `editTurn` correctly overwrites a prior result and recalculates.
- `overrideRoundScore` marks the round as overridden and uses the manual value in game totals.
- `resetGame` returns the state to `setup`.

### Player pairing
- For a 4-player team, turn indices 0-3 produce the correct pairs.
- For teams with 1-3 players, pairing degrades without throwing.

### Validation schemas
- `TurnInputSchema` rejects akat + papit > 40.
- `TurnInputSchema` accepts boundary values (0+0, 0+40, 40+0, 20+20).
- `GameSetupSchema` rejects empty team names and empty player lists.
- `RoundOverrideSchema` accepts positive integers (field-cleared scenario).

## Out of Scope

- **Backend / persistence** — no server, no database, no localStorage. One browser session = one game.
- **Kuokkavieraat tracking** — kyykkäs bouncing into the gap between target squaret are treated as cleared. See ADR-0001.
- **Gender-specific throw lines** — the app does not track player gender or display throw distances.
- **Avaus as a distinct event** — the mandatory opening throw is treated as part of the first turn.
- **Tournament management** — no brackets, standings tables, or multi-game history.
- **More than 2 teams / non-standard formats** — the app assumes exactly 2 teams of 1-4 players.
- **Referee authentication or multi-device sync** — no login, no shared state across devices.
- **Offline PWA / installable app** — the app is a mobile web page; no service worker or install prompt in MVP.

## Further Notes

- All domain terminology in code (variable names, type names, action names) should follow the glossary in `CONTEXT.md`. Avoid English synonyms for Finnish game concepts where a canonical Finnish term exists.
- The scoring engine is the most rules-sensitive module. When in doubt, the rules document at `docs/rules-of-kyykka.md` is the authoritative source.
- The `overrideRoundScore` mechanism exists specifically to handle field-recording errors. It should be clearly labelled in the UI as a correction tool, not a primary input method.
- Nurkkapappi (a kyykkä touching both the back and side boundary) is scored identically to a regular pappi (−1). No UI distinction is needed.
