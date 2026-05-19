# Issue 5: Field-cleared bonus detection + UI

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

When a team enters akkat = 0 and papit = 0 before all 16 kartut have been used, the game square is cleared and the team earns positive points equal to the number of unused kartut. This slice wires that scoring path into the live recording flow.

**What this slice delivers end-to-end:**

1. **Auto-detection** — When the referee confirms a turn with akkat = 0 and papit = 0, the scoring engine's `fieldCleared` flag is set. The store marks the round as cleared at that turn index.
2. **Bonus display** — The TurnStep immediately shows a field-cleared banner (e.g. "Kenttä tyhjä! +4 pistettä") with the calculated unused-karttu bonus.
3. **Skip remaining turns** — The cleared team's remaining turns for the round are skipped; the app advances to the opposing team's next turn (or to halftime if the opposing team is also done).
4. **Score update** — The live scoreboard reflects the positive round score for the cleared team.

Field-cleared detection is already implemented in the scoring engine (Issue 2); this slice integrates it into the UI and store flow.

## Acceptance criteria

- [ ] Entering akkat = 0 + papit = 0 triggers the field-cleared path
- [ ] A Finnish-language banner displays the bonus point total
- [ ] The cleared team's remaining turns are skipped without requiring referee action
- [ ] The scoreboard updates immediately to show the positive round score
- [ ] Normal play (no clear) is unaffected
- [ ] Store tests verify the skip-remaining-turns transition

## Blocked by

- Issue 4: Turn recording — basic flow
