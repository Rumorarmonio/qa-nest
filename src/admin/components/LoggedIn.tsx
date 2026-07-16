import { Box, CheckBox, CurrentUserNav, Label } from '@adminjs/design-system'
import type React from 'react'

type LoggedInProps = {
  session: {
    email: string
    title?: string
    avatarUrl?: string
    theme?: string
  }
  paths: {
    logoutPath: string
  }
}

function getAdminRootPath(logoutPath: string): string {
  return logoutPath.replace(/\/logout$/, '')
}

const LoggedIn = (props: LoggedInProps): React.JSX.Element => {
  const { session, paths } = props
  const adminRootPath = getAdminRootPath(paths.logoutPath)
  const isDarkTheme = (session.theme || 'dark') === 'dark'

  return (
    <Box
      flexShrink={0}
      display='flex'
      alignItems='center'
      gap='default'
      data-css='logged-in'
    >
      <Box
        display='flex'
        alignItems='center'
        gap='default'
        pr='lg'
      >
        <CheckBox
          id='adminjs-theme-toggle'
          checked={isDarkTheme}
          onChange={() => {
            void fetch(`${adminRootPath}/theme/toggle`, { method: 'POST' }).then(() => {
              window.location.reload()
            })
          }}
        />
        <Label
          htmlFor='adminjs-theme-toggle'
          mb='0'
          style={{ cursor: 'pointer' }}
        >
          Dark mode
        </Label>
      </Box>
      <CurrentUserNav
        name={session.email}
        title={session.title}
        avatarUrl={session.avatarUrl}
        lineActions={[
          {
            label: 'Logout',
            href: paths.logoutPath,
            icon: 'LogOut',
          },
        ]}
      />
    </Box>
  )
}

export default LoggedIn
