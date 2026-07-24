import { ComponentLoader } from 'adminjs'
import { dark, light } from '@adminjs/themes'

import { PrismaService } from '@/prisma/prisma.service'

import { createAdminAuthenticate } from './setup/admin.auth'
import { createAdminResources } from './setup/admin.resources'
import { createAdminSessionStore, getDatabaseName } from './setup/admin.session'
import { parseBoolean, requireEnv } from './setup/admin.env'
import { registerAdminThemeToggleRoute } from './setup/admin.theme'

type AdminToolkit = {
  admin: {
    options: {
      rootPath: string
      loginPath: string
    }
  }
  router: any
}

export async function setupAdminPanel(prismaService: PrismaService): Promise<AdminToolkit> {
  const [{ default: AdminJS }, { default: AdminJSExpress }, sqlAdapter] = await Promise.all([
    import('adminjs'),
    import('@adminjs/express'),
    import('@adminjs/sql'),
  ])

  const { Adapter, Database, Resource } = sqlAdapter

  AdminJS.registerAdapter({
    Database,
    Resource,
  })

  const connectionString = requireEnv('DATABASE_URL')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const sessionStore = createAdminSessionStore(connectionString)
  const componentLoader = new ComponentLoader()
  componentLoader.override('LoggedIn', './components/LoggedIn')

  const db = await new Adapter('postgresql', {
    connectionString,
    database: getDatabaseName(connectionString),
  }).init()

  const admin = new AdminJS({
    rootPath: '/admin',
    componentLoader,
    defaultTheme: dark.id,
    availableThemes: [dark, light],
    resources: createAdminResources(db),
  })

  void admin.watch()

  const router = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: createAdminAuthenticate(prismaService),
      cookieName: 'adminjs',
      cookiePassword: requireEnv('ADMINJS_COOKIE_PASSWORD'),
    },
    null,
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      secret: requireEnv('ADMINJS_SESSION_SECRET'),
      cookie: {
        httpOnly: true,
        secure: parseBoolean(
          process.env.ADMINJS_COOKIE_SECURE,
          process.env.NODE_ENV === 'production',
        ),
        sameSite: 'lax',
      },
    },
  )

  registerAdminThemeToggleRoute(router, admin.options.loginPath)

  return {
    admin,
    router,
  }
}
