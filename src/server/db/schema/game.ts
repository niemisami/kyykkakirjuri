import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { baseColumns } from '../schemaHelpers'
import { user } from './auth-schema'
import { event } from './event'

export const game = pgTable('game', {
  ...baseColumns('game_id'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  eventId: integer('event_id').references(() => event.id),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  sport: varchar('sport', { length: 255 }).notNull().default('kyykkä'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
})
