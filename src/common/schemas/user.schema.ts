import { z } from 'zod'

export const userRoleSchema = z.enum(['USER', 'ADMIN'])

export const userPreviewSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
})
