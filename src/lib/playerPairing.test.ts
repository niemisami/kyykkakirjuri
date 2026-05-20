import { describe, it, expect } from 'vitest'
import { getPlayerPair } from './playerPairing'

describe('getPlayerPair — 4 players', () => {
  const players = ['Alice', 'Bob', 'Carol', 'Dave']

  it('turn 0 → players 0+1', () => {
    expect(getPlayerPair(players, 0)).toEqual(['Alice', 'Bob'])
  })

  it('turn 1 → players 2+3', () => {
    expect(getPlayerPair(players, 1)).toEqual(['Carol', 'Dave'])
  })

  it('turn 2 → players 0+1', () => {
    expect(getPlayerPair(players, 2)).toEqual(['Alice', 'Bob'])
  })

  it('turn 3 → players 2+3', () => {
    expect(getPlayerPair(players, 3)).toEqual(['Carol', 'Dave'])
  })
})

describe('getPlayerPair — 3 players', () => {
  const players = ['Alice', 'Bob', 'Carol']

  it('turn 0 → players[0] + players[1]', () => {
    expect(getPlayerPair(players, 0)).toEqual(['Alice', 'Bob'])
  })

  it('turn 1 → players[2] + players[0] (wrap)', () => {
    expect(getPlayerPair(players, 1)).toEqual(['Carol', 'Alice'])
  })

  it('turn 2 → players[0] + players[1]', () => {
    expect(getPlayerPair(players, 2)).toEqual(['Alice', 'Bob'])
  })

  it('turn 3 → players[2] + players[0] (wrap)', () => {
    expect(getPlayerPair(players, 3)).toEqual(['Carol', 'Alice'])
  })
})

describe('getPlayerPair — 2 players', () => {
  const players = ['Alice', 'Bob']

  it('turn 0 → players[0] + players[1]', () => {
    expect(getPlayerPair(players, 0)).toEqual(['Alice', 'Bob'])
  })

  it('turn 1 → players[0] + players[1] (both wrap)', () => {
    expect(getPlayerPair(players, 1)).toEqual(['Alice', 'Bob'])
  })

  it('turn 2 → players[0] + players[1]', () => {
    expect(getPlayerPair(players, 2)).toEqual(['Alice', 'Bob'])
  })

  it('turn 3 → players[0] + players[1] (both wrap)', () => {
    expect(getPlayerPair(players, 3)).toEqual(['Alice', 'Bob'])
  })
})

describe('getPlayerPair — 1 player', () => {
  const players = ['Alice']

  it('turn 0 → player 0 twice', () => {
    expect(getPlayerPair(players, 0)).toEqual(['Alice', 'Alice'])
  })

  it('turn 1 → player 0 twice', () => {
    expect(getPlayerPair(players, 1)).toEqual(['Alice', 'Alice'])
  })

  it('turn 2 → player 0 twice', () => {
    expect(getPlayerPair(players, 2)).toEqual(['Alice', 'Alice'])
  })

  it('turn 3 → player 0 twice', () => {
    expect(getPlayerPair(players, 3)).toEqual(['Alice', 'Alice'])
  })
})
