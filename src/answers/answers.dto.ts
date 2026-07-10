import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { answerSchema } from '@/common/schemas/answer.schema'
import { answerTextFieldSchema } from '@/common/schemas/fields.schema'
import { createUuidParamSchema } from '@/common/schemas/param.schema'

export class AnswerDto extends createZodDto(answerSchema, { codec: true }) {}

export const createAnswerSchema = z
  .object({
    answerText: answerTextFieldSchema,
    isBest: z.boolean().optional(),
  })
  .strict()

export type CreateAnswerInput = z.output<typeof createAnswerSchema>

export class CreateAnswerDto extends createZodDto(createAnswerSchema) {}

export const updateAnswerSchema = createAnswerSchema.pick({ answerText: true }).partial().strict()

export type UpdateAnswerInput = z.output<typeof updateAnswerSchema>

export class UpdateAnswerDto extends createZodDto(updateAnswerSchema) {}

export const questionIdParamSchema = createUuidParamSchema('questionId')
export class QuestionIdParamDto extends createZodDto(questionIdParamSchema) {}
