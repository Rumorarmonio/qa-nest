import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { dateAsIsoString } from '@/common/schemas/date.schema'

export const answerSchema = z.object({
  id: z.uuid(),
  questionId: z.uuid(),
  userName: z.string().min(1),
  answerText: z.string().min(1),
  isBest: z.boolean(),
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export class AnswerDto extends createZodDto(answerSchema, { codec: true }) {}

export const createAnswerSchema = z.object({
  userName: z.string().min(1),
  answerText: z.string().min(1),
  isBest: z.boolean().optional(),
})

export class CreateAnswerDto extends createZodDto(createAnswerSchema.strict()) {}

export const updateAnswerSchema = z
  .object({
    userName: z.string().min(1).optional(),
    answerText: z.string().min(1).optional(),
  })
  .strict()

export class UpdateAnswerDto extends createZodDto(updateAnswerSchema) {}

export const questionIdParamSchema = z
  .object({
    questionId: z.uuid(),
  })
  .strict()

export class QuestionIdParamDto extends createZodDto(questionIdParamSchema) {}

export const answerIdParamSchema = z
  .object({
    id: z.uuid(),
  })
  .strict()

export class AnswerIdParamDto extends createZodDto(answerIdParamSchema) {}

export const deleteAnswerResultSchema = z.object({
  deleted: z.boolean(),
})

export class DeleteAnswerResultDto extends createZodDto(deleteAnswerResultSchema) {}
