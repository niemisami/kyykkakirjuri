import { authClient } from '@/lib/auth/authClient'
import ProfileButton from './ProfileButton'
import SignInGoogle from './SignInGoogle'
import { useRouteContext } from '@tanstack/react-router'

export default function AuthHeader() {
  const { user } = useRouteContext({ from: '/_authenticated' })

  if(user) {
    return (
      <ProfileButton
        user={{
          name: user.name,
          image: user.image,
        }}
        onSignOut={() => {
          void authClient.signOut()
        }}
      />
    )
  }

  return (
    <SignInGoogle />
  )
}
