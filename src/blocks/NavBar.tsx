import { LinkButton } from '@/components/LinkButton'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { Swords } from 'lucide-react'

type NavRoute = {
  to: LinkProps['to']
  label: string
}

const TOP_ROUTES: NavRoute[] = [
  { to: '/app', label: 'Etusivu' },
  { to: '/games', label: 'Pelit' },
  { to: '/players', label: 'Pelaajat' },
  { to: '/teams', label: 'Joukkueet' },
]

type NavBarProps = {
  children?: React.ReactNode
}

export default function NavBar({ children }: NavBarProps) {
  const matchRoute = useMatchRoute()

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md'>
      <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          <Link to='/app' className='flex items-center gap-2 text-primary'>
            <Swords className='size-5' aria-hidden />
            <span className='text-sm font-bold tracking-tight'>Kyykkäkirjuri</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className='mx-3'>
                <LinkButton
                  to='/games/new'
                >
                  Aloita peli
                </LinkButton>
              </NavigationMenuItem>
              {TOP_ROUTES.map(({ to, label }) => (
                <NavigationMenuItem key={to}>
                  <NavigationMenuLink
                    render={<Link to={to} />}
                    active={!!matchRoute({ to, fuzzy: true })}
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {children && (
          <div className='flex items-center'>
            {children}
          </div>
        )}
      </div>
    </header>
  )
}
