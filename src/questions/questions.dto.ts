import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { dateAsIsoString } from '@/common/schemas/date.schema'

export const userPreviewSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
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

export const updateQuestionSchema = createQuestionSchema.partial()

export class UpdateQuestionDto extends createZodDto(updateQuestionSchema.strict()) {}

export const questionIdParamSchema = z.object({ id: z.uuid() }).strict()
export class QuestionIdParamDto extends createZodDto(questionIdParamSchema) {}

export const deleteQuestionResultSchema = z.object({ deleted: z.boolean() })
export class DeleteQuestionResultDto extends createZodDto(deleteQuestionResultSchema) {}

const booleanFromQuerySchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => (typeof value === 'boolean' ? value : value === 'true'))

export const listQuestionsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    includeAnswers: booleanFromQuerySchema.optional().default(false),
    answersLimit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.includeAnswers && value.answersLimit !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answersLimit'],
        message: 'answersLimit can be used only when includeAnswers=true',
      })
    }
  })
  .strict()

export class ListQuestionsQueryDto extends createZodDto(listQuestionsQuerySchema) {}

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

export const questionListItemSchema = questionSchema.extend({
  answersCount: z.number().int().min(0),
  answers: z.array(answerPreviewSchema).optional(),
})

export const questionsListResponseSchema = z.object({
  items: z.array(questionListItemSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
})

export class QuestionsListResponseDto extends createZodDto(questionsListResponseSchema, {
  codec: true,
}) {}
