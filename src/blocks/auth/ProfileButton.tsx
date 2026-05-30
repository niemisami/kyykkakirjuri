import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import SignOut from './SignOut'

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
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const displayName = useMemo(() => getDisplayName(user.name), [user.name])
  const initial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    if(!isOpen) {
      return undefined
    }

    function onPointerDown(event: PointerEvent) {
      if(!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function onEscape(event: KeyboardEvent) {
      if(event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className='relative'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        aria-haspopup='menu'
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className='h-10 rounded-full pl-1.5 pr-3'
      >
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
      </Button>

      {isOpen
        ? (
          <div
            role='menu'
            className='absolute right-0 top-[calc(100%+0.5rem)] w-40 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg shadow-black/5 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/30'
          >
            <SignOut
              onSignOut={() => {
                setIsOpen(false)
                onSignOut()
              }}
            />
          </div>
        )
        : null}
    </div>
  )
}
