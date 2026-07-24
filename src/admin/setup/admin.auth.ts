import { UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

import { PrismaService } from '@/prisma/prisma.service'

export function createAdminAuthenticate(prismaService: PrismaService) {
  return async (email: string, password: string) => {
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
}
