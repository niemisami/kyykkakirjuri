import { eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'

import { ensureSession } from '@/lib/auth/authFunctions'
import { db } from '@/server/db'
import { player } from '@/server/db/schema'

import { myPlayerCreateSchema, myPlayerUpdateSchema } from './schemas'

export const myPlayerCreate = createServerFn({ method: 'POST' })
  .inputValidator(myPlayerCreateSchema)
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

export const myPlayerUpdate = createServerFn({ method: 'POST' })
  .inputValidator(myPlayerUpdateSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    const [updated] = await db
      .update(player)
      .set({ name: data.name, email: data.email ?? null })
      .where(eq(player.userId, session.user.id))
      .returning()
    return updated
  })
