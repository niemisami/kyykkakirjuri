import AuthHeader from '@/blocks/auth/AuthHeader'
import SignInGoogle from '@/blocks/auth/SignInGoogle'
import NavBar from '@/blocks/NavBar'
import { getSession } from '@/lib/auth/authFunctions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

/**
 * Cache session on client to prevent _authenticated routes from being reloaded on each navigation and link hover.
 */
const sessionQuery = () => ({
  queryKey: ['session'],
  queryFn: async () => {
    const data = await getSession()
    return data
  },
  staleTime: 1000 * 60 * 5,
})

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery())
    if(!session) {
      throw redirect({ to: '/' })
    }
    return { user: session.user }
  },
  errorComponent: ({ error }) => {
    if(error.message === 'Not authenticated') {
      return (
        <div className='flex items-center justify-center p-12'>
          <SignInGoogle />
        </div>
      )
    }

    throw error
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <NavBar>
        <AuthHeader />
      </NavBar>
      <Outlet />
    </div>
  )
}
