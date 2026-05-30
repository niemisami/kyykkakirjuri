import AuthHeader from '@/blocks/auth/AuthHeader'
import SignInGoogle from '@/blocks/auth/SignInGoogle'
import { getSession } from '@/lib/auth/authFunctions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSession()

    if(!session) {
      throw redirect({ to: '/' })
    }

    console.log(session)
    return { user: session.user }
  },
  errorComponent: ({ error }) => {
    if(error.message === 'Not authenticated') {
      return (
        <div className='flex items-center justify-center p-12'>
          <SignInGoogle />
          {/* <SignIn routing='hash' forceRedirectUrl={window.location.href} /> */}
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
      <AuthHeader />
      <Outlet />
    </div>
  )
}
