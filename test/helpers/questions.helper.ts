import { apiRoutes } from '@test/constants/api-routes'
import type { RequestFactory } from '@test/helpers/auth.helper'

type CreateQuestionPayload = {
  title: string
  questionText: string
}

type CreateQuestionResponseBody = {
  id: string
  authorId: string
  author: {
    id: string
    name: string
  }
  title: string
  questionText: string
  createdAt: string
  updatedAt: string
}

type UpdateQuestionPayload = Partial<CreateQuestionPayload>

export async function createQuestion(
  request: RequestFactory,
  accessToken: string,
  overrides: Partial<CreateQuestionPayload> = {},
): Promise<CreateQuestionResponseBody> {
  const payload: CreateQuestionPayload = {
    title: 'E2E question title',
    questionText: 'E2E question text',
    ...overrides,
  }

  const response = await request()
    .post(apiRoutes.questions.create)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(201)

  return response.body as CreateQuestionResponseBody
}

export async function updateQuestion(
  request: RequestFactory,
  accessToken: string,
  questionId: string,
  payload: UpdateQuestionPayload,
): Promise<CreateQuestionResponseBody> {
  const response = await request()
    .patch(apiRoutes.questions.update(questionId))
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(200)

  return response.body as CreateQuestionResponseBody
}
