import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { nameFieldSchema } from '@/common/schemas/fields.schema'

export const userRoleSchema = z.enum(UserRole)

export const userPreviewSchema = z.object({
  id: z.uuid(),
  name: nameFieldSchema,
})
