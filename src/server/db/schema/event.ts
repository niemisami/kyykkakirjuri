import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { baseColumns } from '../schemaHelpers'

export const event = pgTable('event', {
  ...baseColumns('event_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  teamCount: integer('team_count').notNull(),
})
