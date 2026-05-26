import {
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'

/**
 * Common timestamp columns for created/updated tracking.
 */
export const dateColumns = () => ({
  createdAt: timestamp('created_at', { withTimezone: true })
    .$default(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

/**
 * Common integer primary key + timestamp columns.
 * Use only for tables that should use an auto-incrementing integer ID.
 */
export const baseColumns = (columnName: string) => ({
  id: integer(columnName).primaryKey().generatedAlwaysAsIdentity(),
  ...dateColumns(),
})
