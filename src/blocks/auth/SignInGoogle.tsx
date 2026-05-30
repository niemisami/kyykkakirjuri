import SignIn from './SignIn'
import { authClient } from '@/lib/auth/authClient'

type SignInProps = {
  disabled?: boolean
}

export default function SignInGoogle({ disabled = false }: SignInProps) {
  return (
    <SignIn
      disabled={disabled}
      onSignIn={() => {
        void authClient.signIn.social({
          provider: 'google',
        })
      }}
    />
  )
}
