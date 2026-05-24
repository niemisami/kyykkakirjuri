import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

import { dateColumns } from '../schemaHelpers'
import { game } from './game'
import { team } from './team'

export const gameTeam = pgTable('game_team', {
  gameTeamId: integer('game_team_id').primaryKey().generatedAlwaysAsIdentity(),
  teamId: integer('team_id').notNull().references(() => team.teamId),
  gameId: integer('game_id').notNull().references(() => game.gameId),
  name: varchar('name', { length: 255 }).notNull(),
  home: varchar('home', { length: 255 }),
  description: text('description'),
  ...dateColumns(),
})
