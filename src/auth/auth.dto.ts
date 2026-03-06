import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import {
  emailFieldSchema,
  loginPasswordFieldSchema,
  nameFieldSchema,
  nonEmptyString,
  passwordFieldSchema,
} from '@/common/schemas/fields.schema'
import { userSchema } from '@/users/users.dto'

export const registerSchema = z
  .object({
    name: nameFieldSchema,
    email: emailFieldSchema,
    password: passwordFieldSchema,
  })
  .strict()

export class RegisterDto extends createZodDto(registerSchema) {}

export const loginSchema = z
  .object({
    email: emailFieldSchema,
    password: loginPasswordFieldSchema,
  })
  .strict()

export class LoginDto extends createZodDto(loginSchema) {}

export const authResponseSchema = z.object({
  accessToken: nonEmptyString,
  user: userSchema,
})

export class AuthResponseDto extends createZodDto(authResponseSchema, { codec: true }) {}
