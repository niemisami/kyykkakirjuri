import { describe, it, expect } from 'vitest'
import { GameSetupSchema, TurnInputSchema, RoundOverrideSchema } from './schemas'

// ── GameSetupSchema ───────────────────────────────────────────────────────────

describe('GameSetupSchema — valid inputs', () => {
  const valid = {
    teamA: { name: 'Kotijoukkue', players: ['Alice', 'Bob'] },
    teamB: { name: 'Vierasjoukkue', players: ['Carol', 'Dave', 'Eve'] },
  }

  it('accepts a valid setup with two teams', () => {
    expect(() => GameSetupSchema.parse(valid)).not.toThrow()
  })

  it('accepts a single player per team', () => {
    const input = {
      teamA: { name: 'A', players: ['Alice'] },
      teamB: { name: 'B', players: ['Bob'] },
    }
    expect(() => GameSetupSchema.parse(input)).not.toThrow()
  })

  it('accepts four players per team', () => {
    const input = {
      teamA: { name: 'A', players: ['p1', 'p2', 'p3', 'p4'] },
      teamB: { name: 'B', players: ['p5', 'p6', 'p7', 'p8'] },
    }
    expect(() => GameSetupSchema.parse(input)).not.toThrow()
  })
})

describe('GameSetupSchema — invalid inputs', () => {
  it('rejects empty team name', () => {
    const result = GameSetupSchema.safeParse({
      teamA: { name: '', players: ['Alice'] },
      teamB: { name: 'B', players: ['Bob'] },
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty player name', () => {
    const result = GameSetupSchema.safeParse({
      teamA: { name: 'A', players: [''] },
      teamB: { name: 'B', players: ['Bob'] },
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero players', () => {
    const result = GameSetupSchema.safeParse({
      teamA: { name: 'A', players: [] },
      teamB: { name: 'B', players: ['Bob'] },
    })
    expect(result.success).toBe(false)
  })

  it('rejects five players', () => {
    const result = GameSetupSchema.safeParse({
      teamA: { name: 'A', players: ['p1', 'p2', 'p3', 'p4', 'p5'] },
      teamB: { name: 'B', players: ['Bob'] },
    })
    expect(result.success).toBe(false)
  })
})

// ── TurnInputSchema ───────────────────────────────────────────────────────────

describe('TurnInputSchema — valid inputs', () => {
  it('accepts akkat=0, papit=0', () => {
    expect(() => TurnInputSchema.parse({ akkat: 0, papit: 0 })).not.toThrow()
  })

  it('accepts akkat=20, papit=20', () => {
    expect(() => TurnInputSchema.parse({ akkat: 20, papit: 20 })).not.toThrow()
  })

  it('accepts akkat=40, papit=0', () => {
    expect(() => TurnInputSchema.parse({ akkat: 40, papit: 0 })).not.toThrow()
  })

  it('accepts akkat=0, papit=40', () => {
    expect(() => TurnInputSchema.parse({ akkat: 0, papit: 40 })).not.toThrow()
  })
})

describe('TurnInputSchema — invalid inputs', () => {
  it('rejects akkat + papit > 40', () => {
    const result = TurnInputSchema.safeParse({ akkat: 21, papit: 20 })
    expect(result.success).toBe(false)
  })

  it('rejects negative akkat', () => {
    const result = TurnInputSchema.safeParse({ akkat: -1, papit: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative papit', () => {
    const result = TurnInputSchema.safeParse({ akkat: 0, papit: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects akkat > 40', () => {
    const result = TurnInputSchema.safeParse({ akkat: 41, papit: 0 })
    expect(result.success).toBe(false)
  })
})

// ── RoundOverrideSchema ───────────────────────────────────────────────────────

describe('RoundOverrideSchema', () => {
  it('accepts a negative integer', () => {
    expect(() => RoundOverrideSchema.parse({ points: -7 })).not.toThrow()
  })

  it('accepts a positive integer (field-cleared scenario)', () => {
    expect(() => RoundOverrideSchema.parse({ points: 8 })).not.toThrow()
  })

  it('accepts zero', () => {
    expect(() => RoundOverrideSchema.parse({ points: 0 })).not.toThrow()
  })

  it('rejects a non-integer', () => {
    const result = RoundOverrideSchema.safeParse({ points: 3.5 })
    expect(result.success).toBe(false)
  })
})
