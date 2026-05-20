import { describe, expect, it, vi } from 'vitest'
import {
  clearStorage,
  clearVersionedKeys,
  loadFromStorage,
  persistToStorage,
  removeFromStorage,
  typedStorage,
  v1Key,
  versionKey,
} from './storageHelpers.js'

describe('storageHelpers', () => {
  it('builds versioned key prefixes', () => {
    expect(versionKey('2')('user')).toBe('v2:user')
    expect(v1Key('settings')).toBe('v1:settings')
  })

  it('clears only matching versioned keys', () => {
    const removeItem = vi.fn()
    const storage = {
      'v1:foo': '1',
      'v1:bar': '2',
      'v2:baz': '3',
      'plain': '4',
      removeItem,
    } as unknown as Storage

    clearVersionedKeys(storage, '1')

    expect(removeItem).toHaveBeenCalledTimes(2)
    expect(removeItem).toHaveBeenCalledWith('v1:foo')
    expect(removeItem).toHaveBeenCalledWith('v1:bar')
  })

  it('calls clear on storage', () => {
    const clear = vi.fn()
    const storage = { clear } as unknown as Storage

    clearStorage(storage)

    expect(clear).toHaveBeenCalledOnce()
  })

  it('removes a key from storage', () => {
    const removeItem = vi.fn()
    const storage = { removeItem } as unknown as Storage

    removeFromStorage(storage, 'profile')

    expect(removeItem).toHaveBeenCalledWith('profile')
  })

  it('loads parsed data and falls back to default for missing or invalid values', () => {
    const getItem = vi.fn()
    const storage = { getItem } as unknown as Storage
    const defaultData = { enabled: false }

    getItem.mockReturnValueOnce(JSON.stringify({ enabled: true }))
    expect(loadFromStorage(storage, 'flags', defaultData)).toEqual({ enabled: true })

    getItem.mockReturnValueOnce(null)
    expect(loadFromStorage(storage, 'flags', defaultData)).toEqual(defaultData)

    getItem.mockReturnValueOnce('{bad-json')
    expect(loadFromStorage(storage, 'flags', defaultData)).toEqual(defaultData)
  })

  it('persists JSON data and swallows storage errors', () => {
    const setItem = vi.fn()
    const storage = { setItem } as unknown as Storage
    const data = { page: 3 }

    persistToStorage(storage, 'state', data)
    expect(setItem).toHaveBeenCalledWith('state', JSON.stringify(data))

    setItem.mockImplementationOnce(() => {
      throw new Error('quota exceeded')
    })
    expect(() => persistToStorage(storage, 'state', data)).not.toThrow()
  })

  it('creates typed storage facade around key operations', () => {
    const getItem = vi.fn().mockReturnValue(JSON.stringify({ count: 5 }))
    const setItem = vi.fn()
    const removeItem = vi.fn()
    const storage = { getItem, setItem, removeItem } as unknown as Storage
    const store = typedStorage(storage, 'counter', { count: 0 })

    expect(store.getData()).toEqual({ count: 5 })
    store.persistData({ count: 6 })
    store.removeData()

    expect(setItem).toHaveBeenCalledWith('counter', JSON.stringify({ count: 6 }))
    expect(removeItem).toHaveBeenCalledWith('counter')
  })
})
