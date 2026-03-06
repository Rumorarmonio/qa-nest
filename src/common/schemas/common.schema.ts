import { z } from 'zod'

export const deleteResultSchema = z.object({
  deleted: z.boolean(),
})
