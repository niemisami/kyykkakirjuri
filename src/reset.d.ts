import '@total-typescript/ts-reset/array-includes'
import '@total-typescript/ts-reset/array-index-of'
import '@total-typescript/ts-reset/fetch'
import '@total-typescript/ts-reset/filter-boolean'
import '@total-typescript/ts-reset/json-parse'
import '@total-typescript/ts-reset/map-constructor'
import '@total-typescript/ts-reset/map-has'
import '@total-typescript/ts-reset/promise-catch'
import '@total-typescript/ts-reset/set-has'
import '@total-typescript/ts-reset/storage'

/**
 * TS-reset isArray implementation is broken - it casts arrays always to unknown[], even if type is something like T | T[]
 * stolen implementation from https://github.com/mattpocock/ts-reset/pull/56
 */
interface ArrayConstructor {
  isArray: <T>(arg: T[] extends T ? T | T[] : never) => arg is T[] extends T ? T[] : never
}
