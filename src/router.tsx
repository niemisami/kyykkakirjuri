import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './context/RootProvider'
import { AppIcon } from './components/AppIcon'

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
    defaultPendingMs: 1000,
    defaultPendingMinMs: 500,
    defaultPendingComponent: () => (
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <AppIcon className='mx-auto animate-spin' size={48} />
      </div>
    ),
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}
