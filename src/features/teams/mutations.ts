import { db } from '@/server/db'
import { player, team } from '@/server/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { teamCreateSchema, teamUpdateSchema } from './schemas'
import { playerCreateSchema } from '../players/schemas'

export const createTeam = createServerFn({ method: 'POST' })
  .inputValidator(teamCreateSchema)
  .handler(async ({ data }) => {
    const [created] = await db.insert(team).values({
      name: data.name,
      home: data.home ?? null,
      description: data.description ?? null,
      contactEmail: data.contactEmail || null,
    }).returning()
    return created
  })

export const updateTeam = createServerFn({ method: 'POST' })
  .inputValidator(teamUpdateSchema)
  .handler(async ({ data }) => {
    const [updated] = await db.update(team)
      .set({
        name: data.name,
        home: data.home ?? null,
        description: data.description ?? null,
        contactEmail: data.contactEmail || null,
      })
      .where(eq(team.id, data.id))
      .returning()
    return updated
  })

export const createPlayer = createServerFn({ method: 'POST' })
  .inputValidator(playerCreateSchema)
  .handler(async ({ data }) => {
    const [created] = await db.insert(player).values({
      name: data.name,
      email: data.email ?? null,
      teamId: data.teamId,
    }).returning()
    return created
  })

export const removePlayerFromTeam = createServerFn({ method: 'POST' })
  .inputValidator((playerId: number) => playerId)
  .handler(async ({ data: playerId }) => {
    const [updated] = await db.update(player)
      .set({ teamId: null })
      .where(eq(player.id, playerId))
      .returning()
    return updated
  })
