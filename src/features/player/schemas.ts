import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

import { player } from '@/server/db/schema'

export const createMyPlayerSchema = createInsertSchema(player, {
  name: schema => schema.trim().min(1, 'Nimi on pakollinen'),
  email: z.email('Virheellinen sähköpostiosoite').trim().max(255).optional(),
}).pick({
  name: true,
  email: true,
})

export type CreateMyPlayerInput = z.infer<typeof createMyPlayerSchema>
