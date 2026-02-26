import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { userSchema } from '@/users/users.dto'

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.email(),
    password: z.string().min(8).max(128),
  })
  .strict()

export class RegisterDto extends createZodDto(registerSchema) {}

export const loginSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1).max(128),
  })
  .strict()

export class LoginDto extends createZodDto(loginSchema) {}

export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: userSchema,
})

export class AuthResponseDto extends createZodDto(authResponseSchema, { codec: true }) {}
