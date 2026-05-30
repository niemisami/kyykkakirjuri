import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { admin } from 'better-auth/plugins'

import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { env } from '@/env'
import { db } from '@/server/db'

export type Role = 'admin' | 'user'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: {
        type: ['user', 'admin'],
        required: true,
        defaultValue: 'user',
        input: false, // don't allow user to set role
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [admin(), tanstackStartCookies()],
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
})
