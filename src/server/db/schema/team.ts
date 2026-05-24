import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

import { dateColumns } from '../schemaHelpers'

export const team = pgTable('team', {
  teamId: integer('team_id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  home: varchar('home', { length: 255 }),
  description: text('description'),
  contactEmail: varchar('contact_email', { length: 255 }),
  ...dateColumns(),
})
