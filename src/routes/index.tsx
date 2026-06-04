import SignInGoogle from '@/blocks/auth/SignInGoogle'
import { buttonVariants } from '@/components/ui/button'
import { getSession } from '@/lib/auth/authFunctions'
import { cn } from '@/lib/utils'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { BarChart3, Swords, TrendingUp, Users } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    if(session) {
      throw redirect({ to: '/app' })
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className='text-on-surface'>
      <header className='fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md'>
        <nav className='mx-auto flex h-16 max-w-[600px] items-center justify-between px-5'>
          <div className='flex items-center gap-2'>
            <Swords className='size-6 text-primary' aria-hidden />
            <span className='text-headline-md font-bold tracking-tight text-primary'>
              Kyykkäkirjuri
            </span>
          </div>
          <SignInGoogle className='text-primary font-bold hover:text-primary/80' />
        </nav>
      </header>

      <main className='mx-auto max-w-[600px] overflow-x-hidden px-5 pt-16 pb-8'>
        <section className='flex flex-col items-center py-8 text-center'>
          <div className='relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-primary-container/30 via-secondary/20 to-primary/10'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Swords className='size-40 text-primary/40' strokeWidth={1.25} aria-hidden />
            </div>
            <div className='absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent' />
            <div className='absolute bottom-0 left-0 right-0 flex items-end p-6'>
              <span className='rounded-full bg-primary px-3 py-1 text-label-caps text-primary-foreground'>
                ERÄ 1 KÄYNNISSÄ
              </span>
            </div>
          </div>

          <h1 className='mb-2 text-headline-lg tracking-tight text-on-surface'>
            Kyykkäkirjuri
          </h1>
          <p className='mb-stack-lg max-w-[400px] text-body-lg text-muted-foreground'>
            Kirjaa ja seuraa kyykkäpelien tuloksia helposti ja nopeasti.
          </p>
          <Link
            to='/game'
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full py-4 text-headline-md shadow-lg shadow-primary/20'
            )}
          >
            Aloita kirjaaminen
          </Link>
        </section>

        <section className='space-y-4'>
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-label-caps text-muted-foreground'>OMINAISUUDET</span>
            <div className='h-px flex-grow bg-border/40' />
          </div>

          <div className='space-y-4'>
            <FeatureCard
              icon={<BarChart3 className='size-6' aria-hidden />}
              iconTint='primary'
              title='Tilastot haltuun'
              description='Näet tiimisi sekä omat tilastot ja kehityksesi ajan myötä.'
            />
            <FeatureCard
              icon={<Users className='size-6' aria-hidden />}
              iconTint='secondary'
              title='Jaa ja vertaa'
              description='Jaa tuloksesi ystäviesi kanssa ja vertaa suorituksiasi heidän kanssaan.'
            />
            <FeatureCard
              icon={<TrendingUp className='size-6' aria-hidden />}
              iconTint='primary'
              title='Kehity pelaajana'
              description='Täydellinen työkalu kaikille kyykkäpelaajille, jotka haluavat parantaa peliään ja pitää kirjaa saavutuksistaan.'
            />
          </div>
        </section>

        <section className='glass-panel relative mt-8 overflow-hidden rounded-xl border-2 border-primary/40 p-5'>
          <div className='absolute -right-4 -top-4 rotate-12 opacity-5'>
            <Swords className='size-32' aria-hidden />
          </div>
          <div className='mb-6 flex items-center justify-between'>
            <span className='text-label-caps text-secondary-foreground'>LIVE-TULOSTAULU</span>
            <span className='flex items-center gap-1 text-label-caps text-primary'>
              <span className='size-2 animate-pulse rounded-full bg-primary' /> LIVE
            </span>
          </div>
          <div className='flex items-center justify-around gap-4'>
            <div className='text-center'>
              <p className='mb-2 text-label-caps text-muted-foreground'>ME</p>
              <div className='text-score-display text-primary'>42</div>
            </div>
            <div className='h-12 w-[2px] bg-border/40' />
            <div className='text-center'>
              <p className='mb-2 text-label-caps text-muted-foreground'>HE</p>
              <div className='text-score-display text-muted-foreground'>38</div>
            </div>
          </div>
          <div className='mt-8 flex gap-4'>
            <div className='flex h-12 flex-1 items-center justify-center rounded-full border-2 border-primary font-bold text-primary'>
              −
            </div>
            <div className='flex flex-[2] items-center justify-center rounded-lg border border-outline-variant/20 bg-white text-headline-md font-bold shadow-sm'>
              ERÄ 2
            </div>
            <div className='flex h-12 flex-1 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground'>
              +
            </div>
          </div>
        </section>
      </main>

      <footer className='mt-8 w-full border-t border-border bg-white py-8'>
        <div className='mx-auto flex max-w-[600px] flex-col items-center gap-4 px-5 text-center'>
          <div className='mb-2 flex items-center gap-2'>
            <Swords className='size-4 text-muted-foreground' aria-hidden />
            <span className='text-label-caps text-muted-foreground'>Kyykkäkirjuri</span>
          </div>
          <div className='flex flex-wrap justify-center gap-4 text-base text-secondary-foreground'>
            <a className='hover:underline' href='#'>Tietosuoja</a>
            <a className='hover:underline' href='#'>Käyttöehdot</a>
            <a className='hover:underline' href='#'>Ota yhteyttä</a>
          </div>
          <p className='mt-4 text-base text-muted-foreground/70'>
            © {new Date().getFullYear()} Kyykkäkirjuri. Kaikki oikeudet pidätetään.
          </p>
        </div>
      </footer>
    </div>
  )
}

type FeatureCardProps = {
  icon: React.ReactNode
  iconTint: 'primary' | 'secondary'
  title: string
  description: string
}

function FeatureCard({ icon, iconTint, title, description }: FeatureCardProps) {
  const tintClasses =
    iconTint === 'primary'
      ? 'bg-primary/10 text-primary'
      : 'bg-secondary/40 text-secondary-foreground'

  return (
    <div className='glass-panel flex flex-col gap-4 rounded-xl border-2 border-transparent p-6 transition-all hover:-translate-y-1 hover:border-primary/20'>
      <div className={cn('flex size-12 items-center justify-center rounded-lg', tintClasses)}>
        {icon}
      </div>
      <div>
        <h3 className='mb-2 text-headline-md text-on-surface'>{title}</h3>
        <p className='text-base text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}
