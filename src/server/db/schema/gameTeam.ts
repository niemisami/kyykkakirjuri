import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

import { baseColumns } from '../schemaHelpers'
import { game } from './game'
import { team } from './team'

export const gameTeam = pgTable('game_team', {
  ...baseColumns('game_team_id'),
  teamId: integer('team_id').notNull().references(() => team.id),
  gameId: integer('game_id').notNull().references(() => game.id),
  name: varchar('name', { length: 255 }).notNull(),
  home: varchar('home', { length: 255 }),
  description: text('description'),
})
