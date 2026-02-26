import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtPayload } from '@/auth/jwt-payload.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET')

    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET is not set')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    })
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload
  }
}
