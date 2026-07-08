import { UserRole } from '@prisma/client'

export type JwtPayload = {
  sub: string // subject
  email: string
  role: UserRole
}
