import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { dateColumns } from '../schemaHelpers'
import { team } from './team'

export const player = pgTable('player', {
  playerId: integer('player_id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  defaultTeamId: integer('default_team_id').notNull().references(() => team.teamId),
  ...dateColumns(),
})
