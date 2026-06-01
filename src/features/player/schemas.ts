import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

import { nullableString } from '@/lib/validationUtils'
import { player } from '@/server/db/schema'

export const playerCreateSchema = createInsertSchema(player, {
  name: schema => schema.trim().min(1, 'Nimi on pakollinen').default(''),
  email: nullableString(z.email('Virheellinen sähköpostiosoite').max(255)).default(''),
  teamId: schema => schema.nullable().default(null),
})
  .pick({
    name: true,
    email: true,
    teamId: true,
  })

export const initialPlayer = playerCreateSchema.parse({})
export type PlayerCreateInput = z.input<typeof playerCreateSchema>

export const playerUpdateSchema = playerCreateSchema.extend({
  id: z.number().int().positive(),
})

export type PlayerUpdateInput = z.input<typeof playerUpdateSchema>
