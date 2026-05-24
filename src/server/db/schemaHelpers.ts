import {
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'

export const dateColumns = () => ({
  createdAt: timestamp('created_at', { withTimezone: true })
    .$default(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const baseColumns = () => ({
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ...dateColumns(),
})
