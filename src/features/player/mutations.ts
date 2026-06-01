import { createServerFn } from '@tanstack/react-start'

import { ensureSession } from '@/lib/auth/authFunctions'
import { db } from '@/server/db'
import { player } from '@/server/db/schema'

import { createMyPlayerSchema } from './schemas'

export const createMyPlayer = createServerFn({ method: 'POST' })
  .inputValidator(createMyPlayerSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    const [created] = await db
      .insert(player)
      .values({
        name: data.name,
        email: data.email ?? null,
        userId: session.user.id,
      })
      .returning()
    return created
  })
