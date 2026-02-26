import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import type { StringValue } from 'ms'

import { AuthController } from '@/auth/auth.controller'
import { AuthService } from '@/auth/auth.service'
import { JwtStrategy } from '@/auth/jwt.strategy'
import { UsersModule } from '@/users/users.module'

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET')

        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET is not set')
        }

        const expiresIn =
          (configService.get<string>('JWT_ACCESS_EXPIRES_IN') as StringValue | undefined) ?? '7d'

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
