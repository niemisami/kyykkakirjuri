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
    DATABASE_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  emptyStringAsUndefined: true,
})
