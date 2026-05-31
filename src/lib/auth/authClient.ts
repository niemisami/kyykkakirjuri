import { createAuthClient } from 'better-auth/react'

import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '.'

export const authClient = createAuthClient({
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
