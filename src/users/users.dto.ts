import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { dateAsIsoString } from '@/common/schemas/date.schema'

export const userRoleSchema = z.enum(['USER', 'ADMIN'])

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
  role: userRoleSchema,
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export class UserDto extends createZodDto(userSchema, { codec: true }) {}
