import { useState } from 'react'
import { QuickGameForm } from './QuickGameForm'
import { TrackedGameForm } from './TrackedGameForm'

export function SetupStep() {
  const [mode, setMode] = useState<'quick' | 'tracked'>('quick')

  return (
    <main className='mx-auto max-w-[600px] px-4 pt-20 pb-8 space-y-6'>
      <div className='text-center'>
        <h1 className='text-headline-lg font-black tracking-tight'>Kyykkakirjuri</h1>
        <p className='mt-1 text-muted-foreground'>Syötä joukkueet ja pelaajat</p>
      </div>

      <div className='glass-panel rounded-2xl p-1 flex shadow-sm'>
        {(['quick', 'tracked'] as const).map(m => (
          <button
            key={m}
            type='button'
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === m
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m === 'quick' ? 'Pikapeli' : 'Kirjattu peli'}
          </button>
        ))}
      </div>

      {mode === 'quick' ? <QuickGameForm /> : <TrackedGameForm />}
    </main>
  )
}
