import { AppIcon } from '@/components/AppIcon'
import { LinkButton } from '@/components/LinkButton'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { Menu } from 'lucide-react'

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

  const isMobile = useIsMobile()

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md'>
      <div className='mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 md:h-14 md:flex-row md:items-center md:justify-between md:py-0'>
        <div className='flex min-w-0 flex-1 flex-wrap items-center gap-3'>
          <Link to='/app' className='flex items-center gap-2 text-primary'>
            <AppIcon className='size-5' aria-hidden />
            <span className='text-sm font-bold tracking-tight'>Kyykkäkirjuri</span>
          </Link>
          <LinkButton to='/games/new' className='shrink-0'>
            Aloita peli
          </LinkButton>

          {isMobile
            ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className='ml-auto'
                  render={(
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      aria-label='Avaa navigaatio'
                    />
                  )}
                >
                  <Menu aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuGroup>
                    {TOP_ROUTES.map(({ to, label }) => (
                      <DropdownMenuItem
                        key={to}
                        render={<Link to={to} />}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                    {children}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
            : (

              <NavigationMenu className='hidden md:flex'>
                <NavigationMenuList>
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
            )}
        </div>
        {(children && !isMobile) && (
          <div className='flex items-center'>
            {children}
          </div>
        )}
      </div>
    </header>
  )
}
