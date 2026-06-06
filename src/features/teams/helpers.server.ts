import { db } from '@/server/db'
import { team } from '@/server/db/schema'
import { eq, inArray } from 'drizzle-orm'

export type Team = Exclude<Awaited<ReturnType<typeof teamQuery>>, null>

export const teamQuery = async ({ id }: { id: number }) => {
  const result = await db.query.team.findFirst({
    where: eq(team.id, id),
  })
  return result ?? null
}

export const teamsQuery = async ({ ids }: { ids?: number[] }): Promise<Team[]> => {
  const result = await db.query.team.findMany({
    where: ids ? inArray(team.id, ids) : undefined,
    orderBy: (teams, { asc }) => asc(teams.name),
  })
  return result
}
