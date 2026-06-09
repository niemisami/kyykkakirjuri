import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './context/RootProvider'

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 1000 * 30, // 30 seconds
    defaultPreloadDelay: 200,
    defaultStructuralSharing: true,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}
