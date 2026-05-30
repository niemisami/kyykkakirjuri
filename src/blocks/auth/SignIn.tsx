import { Button } from '@/components/ui/button'

type SignInProps = {
  onSignIn: () => void
  disabled?: boolean
}

export default function SignIn({ onSignIn, disabled = false }: SignInProps) {
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={onSignIn}
      disabled={disabled}
      className='min-w-22 rounded-full px-4'
    >
      Sign in
    </Button>
  )
}
