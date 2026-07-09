import { apiRoutes } from '@test/e2e/api/api-routes'
import type { RequestFactory } from '@test/e2e/helpers/auth.helper'

import { createE2eLabel } from './e2e-data.helper'

export type CreateQuestionPayload = {
  title: string
  questionText: string
}

export type CreateQuestionResponseBody = {
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

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>

export type CreateQuestionFn = (
  accessToken: string,
  overrides?: Partial<CreateQuestionPayload>,
) => Promise<CreateQuestionResponseBody>

export type UpdateQuestionFn = (
  accessToken: string,
  questionId: string,
  payload: UpdateQuestionPayload,
) => Promise<CreateQuestionResponseBody>

export type QuestionHelpers = {
  createQuestion: CreateQuestionFn
  updateQuestion: UpdateQuestionFn
}

const { questions } = apiRoutes

async function createQuestion(
  request: RequestFactory,
  accessToken: string,
  overrides: Partial<CreateQuestionPayload> = {},
): Promise<CreateQuestionResponseBody> {
  const payload: CreateQuestionPayload = {
    title: createE2eLabel('E2E question title'),
    questionText: createE2eLabel('E2E question text'),
    ...overrides,
  }

  const response = await request()
    .post(questions.create.path)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(201)

  return response.body as CreateQuestionResponseBody
}

async function updateQuestion(
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

export function createQuestionHelpers(request: RequestFactory): QuestionHelpers {
  return {
    createQuestion: (accessToken, overrides) => createQuestion(request, accessToken, overrides),
    updateQuestion: (accessToken, questionId, payload) =>
      updateQuestion(request, accessToken, questionId, payload),
  }
}
