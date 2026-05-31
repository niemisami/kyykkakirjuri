import { z } from 'zod'

import { createInsertSchema } from 'drizzle-zod'

import { player, team } from '@/server/db/schema'

export const teamInputSchema = createInsertSchema(team, {
  name: schema => schema.trim().min(1, 'Nimi on pakollinen'),
  home: z.string().trim().max(255).optional(),
  description: z.string().trim().optional(),
  contactEmail: z.email('Virheellinen sähköpostiosoite').trim().max(255).optional(),
}).pick({
  name: true,
  home: true,
  description: true,
  contactEmail: true,
})

export const teamUpdateSchema = teamInputSchema.extend({ id: z.number() })

export const playerInputSchema = createInsertSchema(player).pick({
  name: true,
  email: true,
})

export const createPlayerSchema = playerInputSchema.extend({ teamId: z.number() })

export type TeamInput = z.infer<typeof teamInputSchema>
export type PlayerInput = z.infer<typeof playerInputSchema>
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>
