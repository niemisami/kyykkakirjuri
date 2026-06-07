import NavCard from '@/components/NavCard'
import { buttonVariants } from '@/components/ui/button'
import { myPlayerQueryOptions } from '@/features/players/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app')({
  loader: ({ context }) => context.queryClient.ensureQueryData(myPlayerQueryOptions),
  component: AppPage,
})

function AppPage() {
  const { data: myPlayer } = useSuspenseQuery(myPlayerQueryOptions)

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Etusivu</h1>

      <div className='space-y-3'>
        <NavCard to='/game' title='Peli' description='Aloita uusi kyykkapeli.' />
        <NavCard to='/teams' title='Joukkueet' description='Selaa ja hallinnoi joukkueita.' />
        <NavCard to='/players' title='Pelaajat' description='Selaa ja hallinnoi pelaajia.' />
      </div>

      <div className='mt-8 border-t pt-6'>
        <h2 className='mb-3 text-base font-semibold'>Oma pelaajatili</h2>
        {myPlayer
          ? (
            <NavCard to='/players/me' title={myPlayer.name} description={myPlayer.email ?? ''} />
          )
          : (
            <div className='rounded-lg border p-4'>
              <p className='text-muted-foreground mb-3 text-sm'>
                Et ole vielä luonut pelaajaprofiilia.
              </p>
              <Link to='/players/me' className={buttonVariants({ size: 'sm' })}>
                Luo pelaajatili
              </Link>
            </div>
          )}
      </div>
    </div>
  )
}
