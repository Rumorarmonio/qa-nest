import { apiRoutes } from '@test/e2e/api/api-routes'
import type { RequestFactory } from '@test/e2e/helpers/auth.helper'

import { createE2eLabel } from './e2e-data.helper'

export type CreateAnswerPayload = {
  answerText: string
  isBest?: boolean
}

export type CreateAnswerResponseBody = {
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

export type UpdateAnswerPayload = Partial<CreateAnswerPayload>

export type CreateAnswerFn = (
  accessToken: string,
  questionId: string,
  overrides?: Partial<CreateAnswerPayload>,
) => Promise<CreateAnswerResponseBody>

export type UpdateAnswerFn = (
  accessToken: string,
  answerId: string,
  payload: UpdateAnswerPayload,
) => Promise<CreateAnswerResponseBody>

export type AnswerHelpers = {
  createAnswer: CreateAnswerFn
  updateAnswer: UpdateAnswerFn
}

const { questions, answers } = apiRoutes

async function createAnswer(
  request: RequestFactory,
  accessToken: string,
  questionId: string,
  overrides: Partial<CreateAnswerPayload> = {},
): Promise<CreateAnswerResponseBody> {
  const payload: CreateAnswerPayload = {
    answerText: createE2eLabel('E2E answer text'),
    ...overrides,
  }

  const response = await request()
    .post(questions.createAnswer.build(questionId))
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(201)

  return response.body as CreateAnswerResponseBody
}

async function updateAnswer(
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

export function createAnswerHelpers(request: RequestFactory): AnswerHelpers {
  return {
    createAnswer: (accessToken, questionId, overrides) =>
      createAnswer(request, accessToken, questionId, overrides),
    updateAnswer: (accessToken, answerId, payload) =>
      updateAnswer(request, accessToken, answerId, payload),
  }
}
