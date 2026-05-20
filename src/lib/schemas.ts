import { z } from 'zod'

// ── Issue 3: Game setup ───────────────────────────────────────────────────────

export const GameSetupSchema = z.object({
  teamA: z.object({
    name: z.string().min(1, 'Joukkueen nimi ei voi olla tyhjä'),
    players: z
      .array(z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä'))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
  teamB: z.object({
    name: z.string().min(1, 'Joukkueen nimi ei voi olla tyhjä'),
    players: z
      .array(z.string().min(1, 'Pelaajan nimi ei voi olla tyhjä'))
      .min(1, 'Joukkueessa pitää olla vähintään 1 pelaaja')
      .max(4, 'Joukkueessa voi olla enintään 4 pelaajaa'),
  }),
})

export type GameSetupInput = z.infer<typeof GameSetupSchema>

// ── Issue 4: Turn input ───────────────────────────────────────────────────────

export const TurnInputSchema = z
  .object({
    akat: z
      .number()
      .int()
      .min(0, 'Akat ei voi olla negatiivinen')
      .max(40, 'Akka-arvo liian suuri'),
    papit: z
      .number()
      .int()
      .min(0, 'Papit ei voi olla negatiivinen')
      .max(40, 'Pappi-arvo liian suuri'),
  })
  .refine((v) => v.akat + v.papit <= 40, {
    message: 'Akat ja papit yhteensä enintään 40',
    path: ['akat'],
  })

export type TurnInput = z.infer<typeof TurnInputSchema>

// ── Issue 7: Round override ───────────────────────────────────────────────────

export const RoundOverrideSchema = z.object({
  points: z.number().int({ message: 'Pisteiden täytyy olla kokonaisluku' }),
})

export type RoundOverrideInput = z.infer<typeof RoundOverrideSchema>
