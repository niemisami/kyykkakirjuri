import { authClient } from '@/lib/auth/authClient'
import ProfileButton from './ProfileButton'
import SignInGoogle from './SignInGoogle'
import { useNavigate, useRouteContext } from '@tanstack/react-router'

export default function AuthHeader() {
  const { user } = useRouteContext({ from: '/_authenticated' })
  const navigate = useNavigate()

  if(user) {
    return (
      <ProfileButton
        user={{
          name: user.name,
          image: user.image,
        }}
        onSignOut={async () => {
          await authClient.signOut()
          navigate({ to: '/' })
        }}
      />
    )
  }

  return (
    <SignInGoogle />
  )
}
