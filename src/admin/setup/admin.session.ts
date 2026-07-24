import { BadGatewayException } from '@nestjs/common'
import connectPgSimple from 'connect-pg-simple'
import session from 'express-session'

export type SessionStoreFactory = new (options: {
  conString: string
  tableName: string
  createTableIfMissing: boolean
}) => session.Store

export function getDatabaseName(connectionString: string): string {
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

export function createAdminSessionStore(connectionString: string): session.Store {
  const PgSessionStore = (
    connectPgSimple as unknown as (sessionLib: typeof session) => SessionStoreFactory
  )(session)

  return new PgSessionStore({
    conString: connectionString,
    tableName: 'adminjs_sessions',
    createTableIfMissing: true,
  })
}
