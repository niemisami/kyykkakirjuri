import { z } from 'zod'

import { createInsertSchema } from 'drizzle-zod'

import { player, team } from '@/server/db/schema'

export const teamCreateSchema = createInsertSchema(team, {
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

export const teamUpdateSchema = teamCreateSchema.extend({ id: z.number() })

export const playerCreateSchema = createInsertSchema(player).pick({
  name: true,
  email: true,
  teamId: true,
})

export type TeamCreateInput = z.infer<typeof teamCreateSchema>
export type PlayerCreateInput = z.infer<typeof playerCreateSchema>
