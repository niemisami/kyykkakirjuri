import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { dateColumns } from '../schemaHelpers'
import { event } from './event'

export const game = pgTable('game', {
  gameId: integer('game_id').primaryKey().generatedAlwaysAsIdentity(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
  eventId: integer('event_id').references(() => event.eventId),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  sport: varchar('sport', { length: 255 }).notNull(),
  ...dateColumns(),
})
