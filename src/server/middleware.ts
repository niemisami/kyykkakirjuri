import { createMiddleware } from '@tanstack/react-start'
import { db } from './db'

export const dbMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next }) => {
    return next({
      context: { db },
    })
  })
