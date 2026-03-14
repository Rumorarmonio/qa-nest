import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

import { AuthResponseDto, LoginDto, RegisterDto } from '@/auth/auth.dto'
import { CurrentUser } from '@/auth/current-user.decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import type { JwtPayload } from '@/auth/jwt-payload.type'
import { AuthService } from '@/auth/auth.service'
import { UserDto } from '@/users/users.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodResponse({ type: AuthResponseDto, status: 201 })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(200)
  @ZodResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ZodResponse({ type: UserDto })
  me(@CurrentUser() currentUser: JwtPayload) {
    return this.authService.me(currentUser.sub)
  }
}
