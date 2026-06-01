import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { ensureSession } from '@/lib/auth/authFunctions'
import { db } from '@/server/db'
import { player } from '@/server/db/schema'

export const fetchMyPlayer = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await ensureSession()
  const result = await db.select().from(player).where(eq(player.userId, session.user.id))
  return result[0] ?? null
})

export const fetchPlayers = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(player).orderBy(player.name)
})

export const fetchPlayer = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const result = await db.select().from(player).where(eq(player.id, id))
    return result[0] ?? null
  })

export const myPlayerQueryOptions = queryOptions({
  queryKey: ['player', 'me'],
  queryFn: () => fetchMyPlayer(),
})

export const playersQueryOptions = queryOptions({
  queryKey: ['player'],
  queryFn: () => fetchPlayers(),
})

export const playerQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['player', id],
    queryFn: () => fetchPlayer({ data: id }),
  })
