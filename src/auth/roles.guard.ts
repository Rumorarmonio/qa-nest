import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '@/auth/roles.decorator'
import type { JwtPayload } from '@/auth/jwt-payload.type'
import { UserRole } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>()
    const user = request.user

    if (!user) {
      // если RolesGuard используется вместе с JwtAuthGuard, сюда обычно не попадём
      throw new ForbiddenException('Authentication required')
    }

    const hasRole = requiredRoles.includes(user.role)

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role')
    }

    return true
  }
}
