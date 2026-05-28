import { toast } from '@/components/ui/sonner'
import type { Query } from '@tanstack/react-query'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UnknownRecord } from 'type-fest'

interface AppQueryMeta extends UnknownRecord {
  errorMessage?: string
  successMessage?: string
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: AppQueryMeta
    mutationMeta: AppQueryMeta
  }
}

export const commonCacheCallbacks = {
  onSuccess: (meta: Query['meta']) => {
    const message = meta?.successMessage
    if(message) {
      toast.success(message)
    }
  },
  onError: (error: Error, meta?: Query['meta']) => {
    if(meta?.isErrorNotificationDisabled) {
      return
    }
    const message = meta?.errorMessage || 'Virhe!'
    toast.error(`${message} ${error.message}`)
  },
}

// const STALE_TIME_DEFAULT = 1000 * 60 * 5 // 5 minutes

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
      // Always throw errors on dev but fallback to react-query's default implementation
        retry: false,
        refetchInterval: false,
        refetchOnWindowFocus: true,
        refetchOnMount: true, // Refetches only stale data on mount
        // staleTime: STALE_TIME_DEFAULT, // Prevent refetches within timeout
      },
      mutations: {
      },
    },
    queryCache: new QueryCache({
      onSuccess: (__data, query) => commonCacheCallbacks.onSuccess(query.meta),
      onError: (error, query) => commonCacheCallbacks.onError(error, query.meta),
    }),
    mutationCache: new MutationCache({
      onSuccess: (__data, __variables, __context, mutation) => commonCacheCallbacks.onSuccess(mutation?.meta),
      onError: (error, __variables, __context, mutation) => commonCacheCallbacks.onError(error, mutation?.meta),
    }),
  })
  return {
    queryClient,
  }
}

export function RootProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
