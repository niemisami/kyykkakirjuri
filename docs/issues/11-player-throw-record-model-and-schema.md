# Issue 11: PlayerThrowRecord model + PlayerThrowInputSchema

## Parent

[ADR-0002: Player-throw input model](../adr/0002-player-throw-input-model.md)

## What to build

Introduce `PlayerThrowRecord` as the new atomic unit of recorded data, and reshape `TurnRecord` so that a turn is defined by its throws rather than a single akat/papit snapshot.

The input model (from ADR-0002): the referee records `knockedOut` (delta — how many kyykät of any type exited the game zone this throw) and `pappiCount` (snapshot — how many kyykät are on the boundary right now). Akat is always derived:

```ts
akat = 40 − Σ(knockedOut across all throws so far in the round) − pappiCount
```

Type shapes:

```ts
interface PlayerThrowRecord {
  knockedOut: number   // delta: exits this throw (akat or pappi)
  pappiCount: number   // snapshot: boundary count right now
}

interface TurnRecord {
  throws: [PlayerThrowRecord] | [PlayerThrowRecord, PlayerThrowRecord]
  result: TurnResult   // set after each throw; reflects state at that throw
}
```

`akat` and `papit` are removed from `TurnRecord` — they are now computed via a `deriveAkat(throwHistory: PlayerThrowRecord[])` helper that takes the full throw history for the round (not just a single record).

`PlayerThrowInputSchema` (Zod): validates `knockedOut ≥ 0`, `pappiCount ≥ 0`, `knockedOut + pappiCount ≤ 40` (field-level bounds only; cumulative validation stays in the store).

## Acceptance criteria

- [x] `PlayerThrowRecord` type exported from the schemas/types module
- [x] `TurnRecord` no longer contains `akat` / `papit` fields; contains `throws` array instead
- [x] `deriveAkat(throwHistory)` helper exported and unit-tested
- [x] `PlayerThrowInputSchema` exported; field-level bounds enforced
- [x] All existing schema tests updated; new tests cover `deriveAkat` and `PlayerThrowInputSchema`
- [x] TypeScript compiles with no errors

## Blocked by

- Issue 10: Scoring engine — scorePlayerThrow
