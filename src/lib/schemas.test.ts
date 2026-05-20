import { describe, it, expect } from 'vitest'
import {
  GameSetupSchema,
  TurnInputSchema,
  RoundOverrideSchema,
  PlayerThrowInputSchema,
  deriveAkat,
} from './schemas'

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
  it('accepts akat=0, papit=0', () => {
    expect(() => TurnInputSchema.parse({ akat: 0, papit: 0 })).not.toThrow()
  })

  it('accepts akat=20, papit=20', () => {
    expect(() => TurnInputSchema.parse({ akat: 20, papit: 20 })).not.toThrow()
  })

  it('accepts akat=40, papit=0', () => {
    expect(() => TurnInputSchema.parse({ akat: 40, papit: 0 })).not.toThrow()
  })

  it('accepts akat=0, papit=40', () => {
    expect(() => TurnInputSchema.parse({ akat: 0, papit: 40 })).not.toThrow()
  })
})

describe('TurnInputSchema — invalid inputs', () => {
  it('rejects akat + papit > 40', () => {
    const result = TurnInputSchema.safeParse({ akat: 21, papit: 20 })
    expect(result.success).toBe(false)
  })

  it('rejects negative akat', () => {
    const result = TurnInputSchema.safeParse({ akat: -1, papit: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative papit', () => {
    const result = TurnInputSchema.safeParse({ akat: 0, papit: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects akat > 40', () => {
    const result = TurnInputSchema.safeParse({ akat: 41, papit: 0 })
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

// ── deriveAkat ────────────────────────────────────────────────────────────────

describe('deriveAkat', () => {
  it('returns 40 for an empty throw history', () => {
    expect(deriveAkat([])).toBe(40)
  })

  it('subtracts knockedOut and pappiCount from 40', () => {
    // 10 knocked out, 5 on boundary → 25 inside
    expect(deriveAkat([{ knockedOut: 10, pappiCount: 5 }])).toBe(25)
  })

  it('accumulates knockedOut across multiple throws', () => {
    // throw 1: 10 knocked out; throw 2: 5 knocked out, 2 pappi → 40-15-2 = 23
    expect(
      deriveAkat([
        { knockedOut: 10, pappiCount: 0 },
        { knockedOut: 5, pappiCount: 2 },
      ]),
    ).toBe(23)
  })

  it('uses the last pappiCount snapshot (not sum)', () => {
    // throw 1: pappiCount=3; throw 2: pappiCount=1 (one pappi was knocked out)
    // total knockedOut=0+1=1, last pappiCount=1 → 40-1-1=38
    expect(
      deriveAkat([
        { knockedOut: 0, pappiCount: 3 },
        { knockedOut: 1, pappiCount: 1 },
      ]),
    ).toBe(38)
  })

  it('returns 0 when all 40 are knocked out', () => {
    expect(deriveAkat([{ knockedOut: 40, pappiCount: 0 }])).toBe(0)
  })
})

// ── PlayerThrowInputSchema ────────────────────────────────────────────────────

describe('PlayerThrowInputSchema — valid inputs', () => {
  it('accepts knockedOut=0, pappiCount=0', () => {
    expect(() => PlayerThrowInputSchema.parse({ knockedOut: 0, pappiCount: 0 })).not.toThrow()
  })

  it('accepts knockedOut=20, pappiCount=20', () => {
    expect(() => PlayerThrowInputSchema.parse({ knockedOut: 20, pappiCount: 20 })).not.toThrow()
  })

  it('accepts knockedOut=40, pappiCount=0', () => {
    expect(() => PlayerThrowInputSchema.parse({ knockedOut: 40, pappiCount: 0 })).not.toThrow()
  })
})

describe('PlayerThrowInputSchema — invalid inputs', () => {
  it('rejects knockedOut + pappiCount > 40', () => {
    const result = PlayerThrowInputSchema.safeParse({ knockedOut: 21, pappiCount: 20 })
    expect(result.success).toBe(false)
  })

  it('rejects negative knockedOut', () => {
    const result = PlayerThrowInputSchema.safeParse({ knockedOut: -1, pappiCount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative pappiCount', () => {
    const result = PlayerThrowInputSchema.safeParse({ knockedOut: 0, pappiCount: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects knockedOut > 40', () => {
    const result = PlayerThrowInputSchema.safeParse({ knockedOut: 41, pappiCount: 0 })
    expect(result.success).toBe(false)
  })
})
