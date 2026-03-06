import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { deleteResultSchema } from '@/common/schemas/common.schema'
import { dateAsIsoString } from '@/common/schemas/date.schema'
import { createUuidParamSchema } from '@/common/schemas/param.schema'
import {
  basePaginationQuerySchema,
  booleanQuerySchema,
  paginationMetaSchema,
} from '@/common/schemas/query.schema'
import { userPreviewSchema } from '@/common/schemas/user.schema'

export const answerPreviewSchema = z.object({
  id: z.uuid(),
  questionId: z.uuid(),
  authorId: z.uuid(),
  author: userPreviewSchema,
  answerText: z.string().min(1),
  isBest: z.boolean(),
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export const questionSchema = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  author: userPreviewSchema,
  title: z.string().min(1),
  questionText: z.string().min(1),
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export class QuestionDto extends createZodDto(questionSchema, { codec: true }) {}

export const createQuestionSchema = z
  .object({
    title: z.string().min(1),
    questionText: z.string().min(1),
  })
  .strict()

export class CreateQuestionDto extends createZodDto(createQuestionSchema) {}

export const updateQuestionSchema = createQuestionSchema.partial().strict()

export class UpdateQuestionDto extends createZodDto(updateQuestionSchema) {}

export const questionIdParamSchema = createUuidParamSchema('id')
export class QuestionIdParamDto extends createZodDto(questionIdParamSchema) {}

export const deleteQuestionResultSchema = deleteResultSchema
export class DeleteQuestionResultDto extends createZodDto(deleteQuestionResultSchema) {}

export const listQuestionsQuerySchema = basePaginationQuerySchema
  .extend({
    includeAnswers: booleanQuerySchema.optional().default(false),
    answersLimit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.includeAnswers && value.answersLimit !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['answersLimit'],
        message: 'answersLimit can be used only when includeAnswers=true',
      })
    }
  })
  .strict()

export class ListQuestionsQueryDto extends createZodDto(listQuestionsQuerySchema) {}

export const questionListItemSchema = questionSchema.extend({
  answersCount: z.number().int().min(0),
  answers: z.array(answerPreviewSchema).optional(),
})

export const questionsListResponseSchema = z.object({
  items: z.array(questionListItemSchema),
  pagination: paginationMetaSchema,
})

export class QuestionsListResponseDto extends createZodDto(questionsListResponseSchema, {
  codec: true,
}) {}
