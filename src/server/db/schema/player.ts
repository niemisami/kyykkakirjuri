import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

import { baseColumns } from '../schemaHelpers'
import { user } from './auth-schema'
import { team } from './team'

export const player = pgTable('player', {
  ...baseColumns('player_id'),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  teamId: integer('team_id').references(() => team.id),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }).unique(),
})
