import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { game } from './game'
import { player } from './player'
import { team } from './team'
import { baseColumns } from '../schemaHelpers'

export const gameTeamPlayer = pgTable('game_team_player', {
  ...baseColumns('game_team_player_id'),
  teamId: integer('team_id').notNull().references(() => team.id),
  gameId: integer('game_id').notNull().references(() => game.id),
  playerId: integer('player_id').notNull().references(() => player.id),
  /** Round in which this player participated (1 or 2). Players can be substituted at halftime. */
  round: integer('round').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
})
