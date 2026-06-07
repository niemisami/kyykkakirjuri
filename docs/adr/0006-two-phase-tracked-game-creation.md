# Two-phase creation for tracked games

When a tracked game starts, a `game` row is immediately created in the database (`startedAt = now()`), returning a `gameId` that is stored in client-side `GameState`. All gameplay runs client-side as before. When the game ends, a second request finalises the row — writing `endedAt`, `gameTeam`, `gameTeamPlayer`, and `gameKyykkaScore` records.

The alternative was a single save at game end, but that would require client-side timestamp tracking for `startedAt` and makes crash recovery harder. The two-phase approach means an abandoned game leaves an incomplete row (no `endedAt`) — these are left as-is and can be cleaned up later.
