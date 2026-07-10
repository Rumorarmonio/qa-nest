import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { dateAsIsoString } from '@/common/schemas/date.schema'
import {
  emailFieldSchema,
  nameFieldSchema,
  passwordFieldSchema,
} from '@/common/schemas/fields.schema'
import { userRoleSchema } from '@/common/schemas/user.schema'

export const userSchema = z.object({
  id: z.uuid(),
  name: nameFieldSchema,
  email: emailFieldSchema,
  role: userRoleSchema,
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export type User = z.output<typeof userSchema>

export class UserDto extends createZodDto(userSchema, { codec: true }) {}

export const createUserSchema = z
  .object({
    name: nameFieldSchema,
    email: emailFieldSchema,
    password: passwordFieldSchema,
    role: userRoleSchema.optional(),
  })
  .strict()

export type CreateUserInput = z.output<typeof createUserSchema>
