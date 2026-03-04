import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { PrismaService } from '@/prisma/prisma.service'
import { UserRole } from '@prisma/client'

type CreateUserInput = {
  name: string
  email: string
  password: string
  role?: UserRole
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByIdOrThrow(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return user
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
  }

  async createUser(input: CreateUserInput) {
    const normalizedEmail = input.email.toLowerCase().trim()
    const passwordHash = await bcrypt.hash(input.password, 10)

    try {
      return await this.prismaService.user.create({
        data: {
          name: input.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: input.role ?? UserRole.USER,
        },
      })
    } catch (error: unknown) {
      // Prisma unique violation
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered')
      }

      throw error
    }
  }

  async validateCredentials(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim()

    const user = await this.prismaService.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const { passwordHash, ...publicUser } = user

    return publicUser
  }
}
