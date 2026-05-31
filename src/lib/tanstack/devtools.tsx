import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

const DevTools = () => {
  return (
    <>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
          openHotkey: ['ctrl-alt-a'],
        }}
        plugins={[
          {
            name: 'Router',
            render: <TanStackRouterDevtoolsPanel />,
            defaultOpen: true,
          },
          {
            name: 'Query',
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}

export default DevTools
