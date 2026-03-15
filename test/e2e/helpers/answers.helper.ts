import { apiRoutes } from '@test/e2e/api/api-routes'
import type { RequestFactory } from '@test/e2e/helpers/auth.helper'

type CreateAnswerPayload = {
  answerText: string
}

type CreateAnswerResponseBody = {
  id: string
  questionId: string
  authorId: string
  author: {
    id: string
    name: string
  }
  answerText: string
  isBest: boolean
  createdAt: string
  updatedAt: string
}

type UpdateAnswerPayload = Partial<CreateAnswerPayload>

const { questions, answers } = apiRoutes

export async function createAnswer(
  request: RequestFactory,
  accessToken: string,
  questionId: string,
  overrides: Partial<CreateAnswerPayload> = {},
): Promise<CreateAnswerResponseBody> {
  const payload: CreateAnswerPayload = {
    answerText: 'E2E answer text',
    ...overrides,
  }

  const response = await request()
    .post(questions.createAnswer.build(questionId))
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(201)

  return response.body as CreateAnswerResponseBody
}

export async function updateAnswer(
  request: RequestFactory,
  accessToken: string,
  answerId: string,
  payload: UpdateAnswerPayload,
): Promise<CreateAnswerResponseBody> {
  const response = await request()
    .patch(answers.update.build(answerId))
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(200)

  return response.body as CreateAnswerResponseBody
}
