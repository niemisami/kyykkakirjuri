# Player-throw input model: knockedOut delta + pappiCount snapshot

Superseded by ADR-0004.

Per player throw the referee records two values: `knockedOut` (how many kyykät of any type exited the game zone during this throw — a delta) and `pappiCount` (how many kyykät are resting on the boundary right now — a snapshot). The app derives remaining akat as `40 - ΣknockedOut - pappiCount`.

## Considered options

1. **Both as remaining counts** (`akatRemaining`, `pappiCount`) — same input shape as the pre-player-throw model, recorded twice per turn instead of once. Discarded: the referee would have to count everything still inside after every single throw, which is harder than counting what just flew out.

2. **Both as deltas** (`knockedOut`, `newPappi`) — referee counts how many exited and how many newly landed on the boundary this throw. Discarded: papit can be both created and destroyed in a single throw, making the net-papit delta ambiguous and error-prone under field conditions.

3. **knockedOut as delta + pappiCount as snapshot** *(chosen)* — referee counts what visibly flew out (easy: it just happened) and what is resting on the line (easy: look at the line). The hard count — what remains inside — is derived by the app and never asked of the referee. `knockedOut` counts all exits regardless of whether the kyykkä was previously inside (akka, -2) or on the boundary (pappi, -1); the scoring distinction is captured by `pappiCount`.

## Consequences

The two inputs have different semantics (delta vs snapshot), which is unusual. Derived akat must be recomputed from the full throw history for the round, not read from a single record.
