import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/env'
import * as schemas from './schema'

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL, {
  max: 10,
  // Disable prepared statements for compatibility with pooled connections.
  prepare: false,
})

if (env.NODE_ENV !== 'production') {
  globalForDb.conn = conn
}

export const db = drizzle(conn, {
  schema: schemas,
  // Keep query logging off by default to avoid noisy output.
  logger: false,
})
