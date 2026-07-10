import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserRole } from '@prisma/client'

import { hasPrismaErrorCode } from '@/common/prisma-error'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateUserInput, User } from '@/users/users.dto'

type UserRow = User & { passwordHash: string }

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: publicUserSelect,
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: publicUserSelect,
    })
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const normalizedEmail = input.email.toLowerCase().trim()
    const hashedPassword = await bcrypt.hash(input.password, 10)

    try {
      return await this.prismaService.user.create({
        data: {
          name: input.name.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: input.role ?? UserRole.USER,
        },
        select: publicUserSelect,
      })
    } catch (error: unknown) {
      // Prisma unique violation
      if (hasPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException('Email is already registered')
      }

      throw error
    }
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim()

    const user = (await this.prismaService.user.findUnique({
      where: { email: normalizedEmail },
    })) as UserRow | null

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }
}
