import SignIn from './SignIn'
import { authClient } from '@/lib/auth/authClient'

type SignInProps = {
  disabled?: boolean
  className?: string
}

export default function SignInGoogle({ disabled = false, className }: SignInProps) {
  return (
    <SignIn
      disabled={disabled}
      className={className}
      onSignIn={() => {
        void authClient.signIn.social({
          provider: 'google',
          callbackURL: '/app',
        })
      }}
    />
  )
}
