import { db } from '@/server/db'
import { player, team } from '@/server/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { eq, inArray } from 'drizzle-orm'
import z from 'zod'

export const fetchTeams = createServerFn({ method: 'GET' })
  .inputValidator(z.array(z.number()).optional())
  .handler(async ({ data: ids }) => {
    if(ids && ids.length > 0) {
      return db.select().from(team).where(inArray(team.id, ids)).orderBy(team.name)
    }
    return db.select().from(team).orderBy(team.name)
  })

export const fetchTeam = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const [foundTeam, players] = await Promise.all([
      db.select().from(team).where(eq(team.id, id)).then(rows => rows[0] ?? null),
      db.select().from(player).where(eq(player.teamId, id)).orderBy(player.name),
    ])
    return { team: foundTeam, players }
  })

export const teamsQueryOptions = (ids?: number[]) => queryOptions({
  queryKey: ['teams', ids],
  queryFn: () => fetchTeams({ data: ids }),
})

export const teamQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['teams', id],
    queryFn: () => fetchTeam({ data: id }),
  })
