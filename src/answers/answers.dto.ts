import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { deleteResultSchema } from '@/common/schemas/common.schema'
import { dateAsIsoString } from '@/common/schemas/date.schema'
import { answerTextFieldSchema } from '@/common/schemas/fields.schema'
import { createUuidParamSchema } from '@/common/schemas/param.schema'
import { userPreviewSchema } from '@/common/schemas/user.schema'

export const answerSchema = z.object({
  id: z.uuid(),
  questionId: z.uuid(),
  authorId: z.uuid(),
  author: userPreviewSchema,
  answerText: answerTextFieldSchema,
  isBest: z.boolean(),
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export class AnswerDto extends createZodDto(answerSchema, { codec: true }) {}

export const createAnswerSchema = z
  .object({
    answerText: answerTextFieldSchema,
    isBest: z.boolean().optional(),
  })
  .strict()

export class CreateAnswerDto extends createZodDto(createAnswerSchema) {}

export const updateAnswerSchema = z
  .object({
    answerText: answerTextFieldSchema.optional(),
  })
  .strict()

export class UpdateAnswerDto extends createZodDto(updateAnswerSchema) {}

export const questionIdParamSchema = createUuidParamSchema('questionId')
export class QuestionIdParamDto extends createZodDto(questionIdParamSchema) {}

export const answerIdParamSchema = createUuidParamSchema('id')
export class AnswerIdParamDto extends createZodDto(answerIdParamSchema) {}

export const deleteAnswerResultSchema = deleteResultSchema
export class DeleteAnswerResultDto extends createZodDto(deleteAnswerResultSchema) {}
