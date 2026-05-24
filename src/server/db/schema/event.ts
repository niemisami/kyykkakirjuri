import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { dateColumns } from '../schemaHelpers'

export const event = pgTable('event', {
  eventId: integer('event_id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  teamCount: integer('team_count').notNull(),
  ...dateColumns(),
})
