import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { ensureSession } from '@/lib/auth/authFunctions'
import { createGameRecord, finalizeGameRecord } from './service.server'

export const createTrackedGame = createServerFn({ method: 'POST' })
  .handler(async () => {
    const session = await ensureSession()
    const created = await createGameRecord({ createdBy: session.user.id })
    if(!created) throw new Error('Failed to create game')
    return created
  })

const TeamPlayerSchema = z.object({
  name: z.string(),
  id: z.number(),
})

const TurnResultSchema = z.object({
  points: z.number(),
  fieldCleared: z.boolean(),
  unusedKartut: z.number(),
})

const TurnRecordSchema = z.object({
  throws: z.array(z.object({ knockedOut: z.number(), pappiCount: z.number() })),
  result: TurnResultSchema,
})

const RoundDataSchema = z.object({
  teamATurns: z.array(TurnRecordSchema),
  teamBTurns: z.array(TurnRecordSchema),
  teamACleared: z.boolean(),
  teamBCleared: z.boolean(),
  teamAOverride: z.number().optional(),
  teamBOverride: z.number().optional(),
}).nullable()

const FinalizeTeamSchema = z.object({
  teamId: z.number(),
  name: z.string(),
  players: z.array(TeamPlayerSchema),
  round1Players: z.array(TeamPlayerSchema).optional(),
})

const FinalizeGameSchema = z.object({
  gameId: z.number(),
  teams: z.tuple([FinalizeTeamSchema, FinalizeTeamSchema]),
  rounds: z.tuple([RoundDataSchema, RoundDataSchema]),
})

export const finalizeGame = createServerFn({ method: 'POST' })
  .inputValidator(FinalizeGameSchema)
  .handler(async ({ data }) => {
    await ensureSession()
    await finalizeGameRecord({
      gameId: data.gameId,
      teams: data.teams,
      rounds: data.rounds as Parameters<typeof finalizeGameRecord>[0]['rounds'],
    })
  })
