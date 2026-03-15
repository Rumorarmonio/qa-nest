import { apiRoutes } from '@test/e2e/api/api-routes'
import type { RequestFactory } from '@test/e2e/helpers/auth.helper'

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

const { questions } = apiRoutes

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
    .post(questions.create.path)
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
    .patch(questions.update.build(questionId))
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(200)

  return response.body as CreateQuestionResponseBody
}
