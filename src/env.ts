import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Keep `process` typed without pulling full Node type libraries into the app tsconfig.
declare const process: {
  env: Record<string, string | undefined>
}

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    VITE_BETTER_AUTH_URL: z.string(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
  },
  runtimeEnv: {
    ...import.meta.env,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    VITE_BETTER_AUTH_URL: process.env.VITE_BETTER_AUTH_URL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  },
  emptyStringAsUndefined: true,
})
