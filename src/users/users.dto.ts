import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { dateAsIsoString } from '@/common/schemas/date.schema'
import { emailFieldSchema, nameFieldSchema } from '@/common/schemas/fields.schema'
import { userRoleSchema } from '@/common/schemas/user.schema'

export const userSchema = z.object({
  id: z.uuid(),
  name: nameFieldSchema,
  email: emailFieldSchema,
  role: userRoleSchema,
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export class UserDto extends createZodDto(userSchema, { codec: true }) {}
