import { db } from '@/server/db'
import { player } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export type Player = Exclude<Awaited<ReturnType<typeof playerQuery>>, null>

export const playerQuery = async ({ id, userId }: { id: number, userId?: never } | { userId: string, id?: never }) => {
  if(!id && !userId) {
    throw new Error('Either id or userId must be provided')
  }

  const result = await db.query.player.findFirst({
    where: userId ? eq(player.userId, userId) : id ? eq(player.id, id) : undefined,
    with: {
      user: { columns: { id: true, image: true } },
    },
  })
  return result ?? null
}

export const playersQuery = async ({ teamId }: { teamId?: number }): Promise<Player[]> => {
  const results = await db.query.player.findMany({
    where: teamId ? eq(player.teamId, teamId) : undefined,
    with: {
      user: { columns: { id: true, image: true } },
    },
    orderBy: (players, { asc }) => asc(players.name),
  })
  return results
}
