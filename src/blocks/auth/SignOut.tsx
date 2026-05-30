import { Button } from '@/components/ui/button'

type SignOutProps = {
  onSignOut: () => void
}

export default function SignOut({ onSignOut }: SignOutProps) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={onSignOut}
      className='w-full justify-start rounded-xl'
    >
      Sign out
    </Button>
  )
}
