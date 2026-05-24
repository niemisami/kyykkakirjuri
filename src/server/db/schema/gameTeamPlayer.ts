import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { dateColumns } from '../schemaHelpers'
import { game } from './game'
import { player } from './player'
import { team } from './team'

export const gameTeamPlayer = pgTable('game_team_player', {
  gameTeamPlayerId: integer('game_team_player_id').primaryKey().generatedAlwaysAsIdentity(),
  teamId: integer('team_id').notNull().references(() => team.teamId),
  gameId: integer('game_id').notNull().references(() => game.gameId),
  playerId: integer('player_id').notNull().references(() => player.playerId),
  name: varchar('name', { length: 255 }).notNull(),
  ...dateColumns(),
})
