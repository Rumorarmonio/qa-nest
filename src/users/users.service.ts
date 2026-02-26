import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { UserEntity } from '@/users/user.entity'
import { UserRole } from '@/users/user-role.enum'

type CreateUserInput = {
  name: string
  email: string
  password: string
  role?: UserRole
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByIdOrThrow(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return user
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    })
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne()
  }

  async createUser(input: CreateUserInput): Promise<UserEntity> {
    const normalizedEmail = input.email.toLowerCase().trim()

    const existingUser = await this.findByEmail(normalizedEmail)

    if (existingUser) {
      throw new ConflictException('Email is already registered')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = this.usersRepository.create({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: input.role ?? UserRole.USER,
    })

    return this.usersRepository.save(user)
  }

  async validateCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmailWithPassword(email)

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
