import { z } from 'zod'

import { createInsertSchema } from 'drizzle-zod'

import { team } from '@/server/db/schema'
import { nullableString } from '@/lib/validationUtils'

export type { Team } from './service.server'

export const teamCreateSchema = createInsertSchema(team, {
  name: schema => schema.trim().min(1, 'Nimi on pakollinen').default(''),
  home: schema => nullableString(schema).default(''),
  description: schema => nullableString(schema).default(''),
  contactEmail: z.email('Virheellinen sähköpostiosoite').max(255).default(''),
}).pick({
  name: true,
  home: true,
  description: true,
  contactEmail: true,
})

export const initialTeam = teamCreateSchema.parse({})
export const teamUpdateSchema = teamCreateSchema.extend({ id: z.number() })

export type TeamCreateInput = z.input<typeof teamCreateSchema>
