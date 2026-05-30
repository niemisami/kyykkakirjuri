import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ProfileUser = {
  name?: string | null
  image?: string | null
}

type ProfileButtonProps = {
  user: ProfileUser
  onSignOut: () => void
}

function getDisplayName(name?: string | null) {
  if(!name?.trim()) {
    return 'User'
  }

  const [firstName] = name.trim().split(/\s+/)
  return firstName || 'User'
}

export default function ProfileButton({ user, onSignOut }: ProfileButtonProps) {
  const displayName = useMemo(() => getDisplayName(user.name), [user.name])
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type='button' variant='outline' size='sm' className='h-10 rounded-full pl-1.5 pr-3' />}>
        {user.image
          ? (
            <img
              src={user.image}
              alt={`${displayName} avatar`}
              className='size-7 rounded-full object-cover'
            />
          )
          : (
            <span className='grid size-7 place-content-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100'>
              {initial}
            </span>
          )}
        <span className='max-w-24 truncate'>{displayName}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
