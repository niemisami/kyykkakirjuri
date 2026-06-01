# Optional 1:1 userId FK on player

`player.userId` is a nullable, unique `text` FK pointing to `user.id`. This establishes an optional 1:1 link so a signed-in user can claim their own player identity on the roster, while roster entries added manually by team managers remain unlinked. We chose nullable over a mandatory link because not every player has a user account and existing data must not break. We chose 1:1 (unique constraint) over 1:many because one identity per person is the right invariant at this stage; if multi-team or multi-profile scenarios emerge later the constraint can be relaxed with a migration.

## Considered Options

- **Auto-create a player on first login** — rejected; too prescriptive. Not every user wants to be a player, and it would create orphaned player records for admins/referees.
- **Separate `user_profile` table** — rejected; over-engineering. The player table already holds the required fields (name, email) and the link is straightforward.
