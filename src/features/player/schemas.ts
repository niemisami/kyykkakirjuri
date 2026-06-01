import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

import { player } from '@/server/db/schema'

export const myPlayerCreateSchema = createInsertSchema(player, {
  name: schema => schema.trim().min(1, 'Nimi on pakollinen'),
  email: z.email('Virheellinen sähköpostiosoite').trim().max(255).optional(),
}).pick({
  name: true,
  email: true,
})

export type MyPlayerCreateInput = z.infer<typeof myPlayerCreateSchema>

export const myPlayerUpdateSchema = myPlayerCreateSchema

export type MyPlayerUpdateInput = z.infer<typeof myPlayerUpdateSchema>
