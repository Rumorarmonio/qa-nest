import { z } from 'zod'

import { dateAsIsoString } from '@/common/schemas/date.schema'
import { answerTextFieldSchema } from '@/common/schemas/fields.schema'
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

export type Answer = z.output<typeof answerSchema>
