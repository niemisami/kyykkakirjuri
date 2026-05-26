// PROTOTYPE COMPONENT — delete when done

import { useEffect } from 'react'

interface PrototypeSwitcherProps {
  variants: { key: string, name: string }[]
  current: string
  onChange: (key: string) => void
}

export function PrototypeSwitcher({ variants, current, onChange }: PrototypeSwitcherProps) {
  const currentIndex = variants.findIndex(v => v.key === current)
  const currentVariant = variants[currentIndex] ?? variants[0]

  const prevKey = variants[((currentIndex - 1) + variants.length) % variants.length]?.key
  const nextKey = variants[(currentIndex + 1) % variants.length]?.key

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement
      const isInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      if(isInput) return
      if(e.key === 'ArrowLeft' && prevKey) onChange(prevKey)
      if(e.key === 'ArrowRight' && nextKey) onChange(nextKey)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevKey, nextKey, onChange])

  if(import.meta.env.PROD) return null

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none'>
      <div className='flex items-center gap-2 bg-foreground text-background rounded-full px-3 py-2 shadow-2xl pointer-events-auto'>
        <button
          onClick={() => prevKey && onChange(prevKey)}
          className='hover:opacity-70 transition-opacity w-7 h-7 flex items-center justify-center rounded-full'
          aria-label='Previous variant'
        >
          ←
        </button>
        <span className='text-label-caps min-w-36 text-center px-1'>
          {currentVariant.key} — {currentVariant.name}
        </span>
        <button
          onClick={() => nextKey && onChange(nextKey)}
          className='hover:opacity-70 transition-opacity w-7 h-7 flex items-center justify-center rounded-full'
          aria-label='Next variant'
        >
          →
        </button>
      </div>
    </div>
  )
}
