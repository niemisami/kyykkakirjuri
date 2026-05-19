import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'
import { Store } from '@tanstack/store'
import { Button } from '@/components/ui/button'

describe('smoke tests', () => {
  it('renders the Button component', () => {
    render(<Button>Testi</Button>)
    expect(screen.getByRole('button', { name: 'Testi' })).toBeInTheDocument()
  })

  it('Zod parses a trivial schema', () => {
    const schema = z.object({ name: z.string() })
    expect(schema.parse({ name: 'kyykka' })).toEqual({ name: 'kyykka' })
  })

  it('@tanstack/store is importable and functional', () => {
    const store = new Store({ count: 0 })
    expect(store.state.count).toBe(0)
  })
})
