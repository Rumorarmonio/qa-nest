import { z } from 'zod'

import { dateAsIsoString } from '@/common/schemas/date.schema'
import { answerTextFieldSchema } from '@/common/schemas/fields.schema'
import { userPreviewSchema, userRoleSchema } from '@/common/schemas/user.schema'

const answerAuthorSchema = userPreviewSchema.extend({
  role: userRoleSchema,
})

export const answerSchema = z.object({
  id: z.uuid(),
  questionId: z.uuid(),
  authorId: z.uuid(),
  author: answerAuthorSchema,
  answerText: answerTextFieldSchema,
  isBest: z.boolean(),
  createdAt: dateAsIsoString,
  updatedAt: dateAsIsoString,
})

export type Answer = z.output<typeof answerSchema>
export type AnswerResponse = z.input<typeof answerSchema>
