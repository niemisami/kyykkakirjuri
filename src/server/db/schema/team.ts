import { pgTable, text, varchar } from 'drizzle-orm/pg-core'

import { baseColumns } from '../schemaHelpers'

export const team = pgTable('team', {
  ...baseColumns('team_id'),
  name: varchar('name', { length: 255 }).notNull(),
  home: varchar('home', { length: 255 }),
  description: text('description'),
  contactEmail: varchar('contact_email', { length: 255 }),
})
