import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteResultSchema = z.object({
  deleted: z.boolean(),
})

export type DeleteResult = z.output<typeof deleteResultSchema>

export class DeleteResultDto extends createZodDto(deleteResultSchema) {}
