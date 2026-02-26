import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const dateAsIsoString = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
})

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
