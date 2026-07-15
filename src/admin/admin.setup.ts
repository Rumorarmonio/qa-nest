import { BadGatewayException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'

import { PrismaService } from '@/prisma/prisma.service'

type AdminToolkit = {
  admin: {
    options: {
      rootPath: string
    }
  }
  router: any
}

function getDatabaseName(connectionString: string): string {
  try {
    const url = new URL(connectionString)
    const databaseName = url.pathname.replace(/^\//, '')

    if (!databaseName) {
      throw new BadGatewayException('DATABASE_URL must include database name')
    }

    return databaseName
  } catch (error) {
    if (error instanceof BadGatewayException) {
      throw error
    }

    throw new BadGatewayException('DATABASE_URL is invalid')
  }
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback
  }

  return value === 'true'
}

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new BadGatewayException(`${name} is not set`)
  }

  return value
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

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new BadGatewayException('DATABASE_URL is not set')
  }

  const sessionStore = new (connectPgSimple(session))({
    conString: connectionString,
    tableName: 'adminjs_sessions',
    createTableIfMissing: true,
  })

  const db = await new Adapter('postgresql', {
    connectionString,
    database: getDatabaseName(connectionString),
  }).init()

  const authenticate = async (email: string, password: string) => {
    const user = await prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    })

    if (!user || user.role !== UserRole.ADMIN) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  }

  const admin = new AdminJS({
    rootPath: '/admin',
    resources: [
      {
        resource: db.table('users'),
        options: {
          navigation: 'Content',
          actions: {
            new: {
              isAccessible: false,
            },
            edit: {
              isAccessible: false,
            },
            delete: {
              isAccessible: false,
            },
          },
          properties: {
            password_hash: {
              isVisible: false,
            },
            created_at: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
            updated_at: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
          },
        },
      },
      {
        resource: db.table('questions'),
        options: {
          navigation: 'Content',
          actions: {
            new: {
              isAccessible: false,
            },
          },
          properties: {
            author_id: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
            title: {
              type: 'string',
            },
            question_text: {
              type: 'textarea',
            },
            created_at: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
            updated_at: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
          },
        },
      },
      {
        resource: db.table('answers'),
        options: {
          navigation: 'Content',
          actions: {
            new: {
              isAccessible: false,
            },
          },
          properties: {
            question_id: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
            author_id: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
            answer_text: {
              type: 'textarea',
            },
            is_best: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: true,
              },
            },
            created_at: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
            updated_at: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
          },
        },
      },
    ],
  })

  admin.watch()

  const router = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: requireEnv('ADMINJS_COOKIE_PASSWORD'),
    },
    null,
    {
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

  return {
    admin,
    router,
  }
}
