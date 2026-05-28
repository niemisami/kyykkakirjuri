import { createAuthClient } from 'better-auth/react'

import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '.'
import { env } from 'better-auth'

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
