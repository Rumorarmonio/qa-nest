import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import type { AuthResponse, LoginInput, RegisterInput } from '@/auth/auth.dto'
import { JwtPayload } from '@/auth/jwt-payload.type'
import { UsersService } from '@/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async buildAuthResponse(userId: string): Promise<AuthResponse> {
    const user = await this.usersService.findByIdOrThrow(userId)

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload)

    return {
      accessToken,
      user,
    }
  }

  async register(dto: RegisterInput) {
    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    })

    return this.buildAuthResponse(user.id)
  }

  async login(dto: LoginInput) {
    const user = await this.usersService.validateCredentials(dto.email, dto.password)
    return this.buildAuthResponse(user.id)
  }

  async me(userId: string) {
    return this.usersService.findByIdOrThrow(userId)
  }
}
