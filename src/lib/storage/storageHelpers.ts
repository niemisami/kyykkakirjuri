type Version = `${number}`
export const versionKey = (version: Version) => (key: string) => `v${version}:${key}`
export const v1Key = versionKey('1') // Create more if needed

/**
 * Usage `clearVersionedKeys('1', localStorage)` or `clearVersionedKeys('1', sessionStorage)`
 */
export const clearVersionedKeys = (storage: Storage, version: Version) => {
  const prefix = versionKey(version)('') // e.g. 'v1:'
  Object.keys(storage).forEach((key) => {
    if(key.startsWith(prefix)) {
      storage.removeItem(key)
    }
  })
}

/**
 * Usage `clearStorage(localStorage)` or `clearStorage(sessionStorage)`
 */
export const clearStorage = (storage: Storage) => {
  storage.clear()
}

export const removeFromStorage = (storage: Storage, key: string) => {
  storage.removeItem(key)
}

export const loadFromStorage = <TData>(storage: Storage, key: string, defaultData: TData): TData => {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : defaultData
  } catch (error) {
    console.error(error)
    return defaultData
  }
}

export const persistToStorage = <TData>(storage: Storage, key: string, data: TData) => {
  try {
    storage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(error)
  }
}

export const typedStorage = <TData>(storage: Storage, key: string, defaultData: TData) => {
  return {
    getData: () => loadFromStorage(storage, key, defaultData),
    persistData: (data: TData) => persistToStorage(storage, key, data),
    removeData: () => removeFromStorage(storage, key),
  }
}
