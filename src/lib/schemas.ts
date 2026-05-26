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

// ── Issue 11: Player-throw input ─────────────────────────────────────────────

export interface PlayerThrowRecord {
  knockedOut: number // delta: exits this throw (akat or pappi)
  pappiCount: number // snapshot: boundary count right now
}

/**
 * Derives the number of akat (kyykät inside the target square) from the
 * cumulative throw history for a team's round.
 * @param throwHistory All PlayerThrowRecords for the round so far, including the current throw
 */
export function deriveAkat(throwHistory: PlayerThrowRecord[]): number {
  const totalKnockedOut = throwHistory.reduce((sum, t) => sum + t.knockedOut, 0)
  const papit = throwHistory.reduce((sum, t) => sum + t.pappiCount, 0)
  return 40 - totalKnockedOut - papit
}

export const PlayerThrowInputSchema = z
  .object({
    knockedOut: z
      .number()
      .int()
      .min(0, 'Poistot ei voi olla negatiivinen')
      .max(40, 'Poistot-arvo liian suuri'),
    pappiCount: z
      .number()
      .int()
      .min(-40, 'Papit ei voi olla alle -40')
      .max(40, 'Pappi-arvo liian suuri'),
  })
  .refine(v => v.knockedOut + v.pappiCount <= 40, {
    message: 'Poistot ja papit yhteensä enintään 40',
    path: ['knockedOut'],
  })

export type PlayerThrowInput = z.infer<typeof PlayerThrowInputSchema>

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
      .min(-40, 'Papit ei voi olla alle -40')
      .max(40, 'Pappi-arvo liian suuri'),
  })
  .refine(v => v.akat + v.papit <= 40, {
    message: 'Akat ja papit yhteensä enintään 40',
    path: ['akat'],
  })

export type TurnInput = z.infer<typeof TurnInputSchema>

// ── Issue 7: Round override ───────────────────────────────────────────────────

export const RoundOverrideSchema = z.object({
  points: z.number().int({ message: 'Pisteiden täytyy olla kokonaisluku' }),
})

export type RoundOverrideInput = z.infer<typeof RoundOverrideSchema>
