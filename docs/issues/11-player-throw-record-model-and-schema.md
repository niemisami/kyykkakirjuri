# Issue 11: PlayerThrowRecord model + PlayerThrowInputSchema

## Parent

[ADR-0004: Signed pappi delta in `pappiCount`](../adr/0004-signed-pappi-delta-in-pappiCount.md)

## What to build

Introduce `PlayerThrowRecord` as the new atomic unit of recorded data, and reshape `TurnRecord` so that a turn is defined by its throws rather than a single akat/papit snapshot.

The input model (from ADR-0004): the referee records `knockedOut` (delta — how many kyykät of any type exited the game zone this throw) and `pappiCount` (signed pappi delta for this throw). Akat is always derived:

```ts
akat = 40 - Σ(knockedOut across all throws so far in the round) - Σ(pappiCount across all throws so far in the round)
```

Type shapes:

```ts
interface PlayerThrowRecord {
  knockedOut: number   // delta: exits this throw (akat or pappi)
  pappiCount: number   // signed delta: papit created (+) or struck back inside (-)
}

interface TurnRecord {
  throws: [PlayerThrowRecord] | [PlayerThrowRecord, PlayerThrowRecord]
  result: TurnResult   // set after each throw; reflects state at that throw
}
```

`akat` and `papit` are removed from `TurnRecord` — they are now computed via a `deriveAkat(throwHistory: PlayerThrowRecord[])` helper that takes the full throw history for the round (not just a single record).

`PlayerThrowInputSchema` (Zod): validates `knockedOut ≥ 0`, `pappiCount ∈ [-40, 40]`, `knockedOut + pappiCount ≤ 40` (field-level bounds only; cumulative validation stays in the store).

## Acceptance criteria

- [x] `PlayerThrowRecord` type exported from the schemas/types module
- [x] `TurnRecord` no longer contains `akat` / `papit` fields; contains `throws` array instead
- [x] `deriveAkat(throwHistory)` helper exported and unit-tested
- [x] `PlayerThrowInputSchema` exported; field-level bounds enforced
- [x] All existing schema tests updated; new tests cover `deriveAkat` and `PlayerThrowInputSchema`
- [x] TypeScript compiles with no errors

## Blocked by

- Issue 10: Scoring engine — scorePlayerThrow
