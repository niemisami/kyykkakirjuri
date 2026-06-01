import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SignInProps = {
  onSignIn: () => void
  disabled?: boolean
  className?: string
}

export default function SignIn({ onSignIn, disabled = false, className }: SignInProps) {
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={onSignIn}
      disabled={disabled}
      className={cn('min-w-22 rounded-full px-4', className)}
    >
      Kirjaudu
    </Button>
  )
}
