# Issue 15: Duplicate player in team causes score insert crash on game finalize

## Problem

`finalizeGameRecord` in `src/features/games/service.server.ts` crashed with a unique constraint violation when the same player appeared more than once in a team's roster:

```
PostgresError: duplicate key value violates unique constraint "game_kyykka_score_unique_idx"
Key (game_id, team_id, player_id, round, turn, throw_index)=(2, 2, 8, 1, 2, 0) already exists.
```

## Root cause

`getPlayerPair` returns the two players throwing in a given turn. When the same player `id` occupies both slots in a pair (e.g. `round1Players = [{id:8}, {id:8}]`), the score row builder generates two rows with identical `(gameId, teamId, playerId, round, turn, throwIndex)` keys in the same batch insert — violating `game_kyykka_score_unique_idx`.

Example with team B roster `[{id:9}, {id:11}, {id:8}, {id:8}]`:
- Turn 2 pair → `[{id:8}, {id:8}]`
- Throw i=0: `(game=2, team=2, player=8, round=1, turn=2, throwIndex=0)`
- Throw i=2: `(game=2, team=2, player=8, round=1, turn=2, throwIndex=0)` ← duplicate

## Fix


## Acceptance criteria

- [] `finalizeGameRecord` completes without error when a team roster contains the same player id twice
