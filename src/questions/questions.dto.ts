import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { answerSchema } from '@/common/schemas/answer.schema'
import { dateAsIsoString } from '@/common/schemas/date.schema'
import { questionTextFieldSchema, titleFieldSchema } from '@/common/schemas/fields.schema'
import {
  basePaginationQuerySchema,
  booleanQuerySchema,
  paginationMetaSchema,
} from '@/common/schemas/query.schema'
import { userPreviewSchema } from '@/common/schemas/user.schema'

export const questionSchema = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  author: userPreviewSchema,
  title: titleFieldSchema,
  questionText: questionTextFieldSchema,
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export type Question = z.output<typeof questionSchema>

export class QuestionDto extends createZodDto(questionSchema, { codec: true }) {}

export const createQuestionSchema = z
  .object({
    title: titleFieldSchema,
    questionText: questionTextFieldSchema,
  })
  .strict()

export type CreateQuestionInput = z.output<typeof createQuestionSchema>

export class CreateQuestionDto extends createZodDto(createQuestionSchema) {}

export const updateQuestionSchema = createQuestionSchema.partial().strict()

export type UpdateQuestionInput = z.output<typeof updateQuestionSchema>

export class UpdateQuestionDto extends createZodDto(updateQuestionSchema) {}

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

export type ListQuestionsQuery = z.output<typeof listQuestionsQuerySchema>

export class ListQuestionsQueryDto extends createZodDto(listQuestionsQuerySchema) {}

export const questionListItemSchema = questionSchema.extend({
  answersCount: z.number().int().min(0),
  answers: z.array(answerSchema).optional(),
})

export type QuestionListItem = z.output<typeof questionListItemSchema>

export const questionsListResponseSchema = z.object({
  items: z.array(questionListItemSchema),
  pagination: paginationMetaSchema,
})

export type QuestionsListResponse = z.output<typeof questionsListResponseSchema>

export class QuestionsListResponseDto extends createZodDto(questionsListResponseSchema, {
  codec: true,
}) {}
