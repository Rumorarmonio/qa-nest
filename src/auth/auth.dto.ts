import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import {
  emailFieldSchema,
  loginPasswordFieldSchema,
  nonEmptyString,
} from '@/common/schemas/fields.schema'
import { createUserSchema, userSchema } from '@/users/users.dto'

export const registerSchema = createUserSchema.omit({ role: true })

export type RegisterInput = z.output<typeof registerSchema>

export class RegisterDto extends createZodDto(registerSchema) {}

export const loginSchema = z
  .object({
    email: emailFieldSchema,
    password: loginPasswordFieldSchema,
  })
  .strict()

export type LoginInput = z.output<typeof loginSchema>

export class LoginDto extends createZodDto(loginSchema) {}

export const authResponseSchema = z.object({
  accessToken: nonEmptyString,
  user: userSchema,
})

export type AuthResponse = z.output<typeof authResponseSchema>

export class AuthResponseDto extends createZodDto(authResponseSchema, { codec: true }) {}
