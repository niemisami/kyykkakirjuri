import { db } from '@/server/db'
import { player, team } from '@/server/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'

export const fetchTeams = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(team).orderBy(team.name)
})

export const fetchTeam = createServerFn({ method: 'GET' })
  .inputValidator((teamId: number) => teamId)
  .handler(async ({ data: teamId }) => {
    const [foundTeam, players] = await Promise.all([
      db.select().from(team).where(eq(team.id, teamId)).then(rows => rows[0] ?? null),
      db.select().from(player).where(eq(player.teamId, teamId)).orderBy(player.name),
    ])
    return { team: foundTeam, players }
  })

export const teamsQueryOptions = queryOptions({
  queryKey: ['teams'],
  queryFn: () => fetchTeams(),
})

export const teamQueryOptions = (teamId: number) =>
  queryOptions({
    queryKey: ['teams', teamId],
    queryFn: () => fetchTeam({ data: teamId }),
  })
