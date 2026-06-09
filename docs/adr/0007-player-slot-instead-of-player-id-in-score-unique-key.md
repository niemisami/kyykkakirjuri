# playerSlot instead of playerId in game_kyykka_score unique key

The unique key on `game_kyykka_score` originally included `player_id` to distinguish throws by different players in the same turn. When a team has fewer than 4 players, `getPlayerPair` wraps the roster via modulo, meaning the same player can legitimately occupy both slots in a pair. This caused a unique constraint violation on insert.

We replaced `player_id` in the unique index with `player_slot` (0 or 1 — the structural position within the throwing pair) so the key becomes `(game_id, team_id, round, turn, player_slot, throw_index)`. This correctly identifies a throw by its position in the game structure rather than player identity, and handles any roster size without collision.

## Considered Options

- **Redefine `throw_index` as 0–3 absolute within the turn** — rejected because it erases the per-player semantic (whether this was the player's first or second karttu), making the column ambiguous.
