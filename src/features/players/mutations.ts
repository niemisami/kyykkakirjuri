import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { ensureSession } from '@/lib/auth/authFunctions'
import { db } from '@/server/db'
import { player } from '@/server/db/schema'

import { playerCreateSchema, playerUpdateSchema } from './schemas'

export const createMyPlayer = createServerFn({ method: 'POST' })
  .inputValidator(playerCreateSchema)
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

export const updateMyPlayer = createServerFn({ method: 'POST' })
  .inputValidator(playerUpdateSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    const [updated] = await db
      .update(player)
      .set({ name: data.name, email: data.email, teamId: data.teamId })
      .where(eq(player.userId, session.user.id))
      .returning()
    return updated
  })

export const updatePlayer = createServerFn({ method: 'POST' })
  .inputValidator(playerUpdateSchema)
  .handler(async ({ data }) => {
    await ensureSession()
    const [updated] = await db
      .update(player)
      .set({ name: data.name, email: data.email, teamId: data.teamId })
      .where(eq(player.id, data.id))
      .returning()
    return updated
  })
