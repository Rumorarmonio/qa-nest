import { randomUUID } from 'node:crypto'

import { apiRoutes } from '@test/constants/api-routes'
import { createAnswer, updateAnswer } from '@test/helpers/answers.helper'
import { loginAsAdmin, loginAsUser } from '@test/helpers/auth.helper'
import { createQuestion } from '@test/helpers/questions.helper'
import { setupE2e } from '@test/helpers/setup-e2e'

describe('Answers (e2e)', () => {
  const { request } = setupE2e()

  let userToken: string
  let adminToken: string
  let questionId: string

  const invalidUuid = 'not-a-uuid'

  beforeAll(async () => {
    const userLoginResponse = await loginAsUser(request)
    const adminLoginResponse = await loginAsAdmin(request)

    userToken = userLoginResponse.accessToken
    adminToken = adminLoginResponse.accessToken

    const createdQuestion = await createQuestion(request, userToken, {
      title: 'Question for answers e2e',
      questionText: 'Question text for answers e2e',
    })

    questionId = createdQuestion.id
  })

  describe('Public', () => {
    it('GET /api/questions/:questionId/answers should return answers list', async () => {
      const response = await request().get(apiRoutes.questions.answers(questionId)).expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('GET /api/questions/:questionId/answers with invalid uuid should return 400', async () => {
      await request().get(apiRoutes.questions.answers(invalidUuid)).expect(400)
    })

    it('GET /api/questions/:questionId/answers with valid non-existing uuid should return 404', async () => {
      const nonExistingQuestionUuid = randomUUID()

      await request().get(apiRoutes.questions.answers(nonExistingQuestionUuid)).expect(404)
    })

    it('GET /api/answers/:id should return answer by id', async () => {
      const createdAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'Answer for get by id',
      })

      const response = await request().get(apiRoutes.answers.byId(createdAnswer.id)).expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdAnswer.id,
          questionId,
          answerText: 'Answer for get by id',
        }),
      )
    })

    it('GET /api/answers/:id with invalid uuid should return 400', async () => {
      await request().get(apiRoutes.answers.byId(invalidUuid)).expect(400)
    })

    it('GET /api/answers/:id with valid non-existing uuid should return 404', async () => {
      const nonExistingAnswerUuid = randomUUID()

      await request().get(apiRoutes.answers.byId(nonExistingAnswerUuid)).expect(404)
    })
  })

  describe('Protected', () => {
    it('POST /api/questions/:questionId/answers without token should return 401', async () => {
      await request()
        .post(apiRoutes.questions.createAnswer(questionId))
        .send({
          answerText: 'Unauthorized answer',
        })
        .expect(401)
    })

    it('POST /api/questions/:questionId/answers with invalid question uuid should return 400', async () => {
      await request()
        .post(apiRoutes.questions.createAnswer(invalidUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Invalid question uuid',
        })
        .expect(400)
    })

    it('POST /api/questions/:questionId/answers with valid non-existing question uuid should return 404', async () => {
      const nonExistingQuestionUuid = randomUUID()

      await request()
        .post(apiRoutes.questions.createAnswer(nonExistingQuestionUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Missing question entity',
        })
        .expect(404)
    })

    it('POST /api/questions/:questionId/answers with invalid body should return 400', async () => {
      await request()
        .post(apiRoutes.questions.createAnswer(questionId))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: '',
        })
        .expect(400)
    })

    it('POST /api/questions/:questionId/answers with user token should create an answer', async () => {
      const response = await request()
        .post(apiRoutes.questions.createAnswer(questionId))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Created from answers.e2e-spec.ts',
        })
        .expect(201)

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          questionId,
          authorId: expect.any(String),
          author: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
          answerText: 'Created from answers.e2e-spec.ts',
          isBest: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      )
    })

    it('PATCH /api/answers/:id with invalid uuid should return 400', async () => {
      await request()
        .patch(apiRoutes.answers.update(invalidUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Invalid uuid patch',
        })
        .expect(400)
    })

    it('PATCH /api/answers/:id with valid non-existing uuid should return 404', async () => {
      const nonExistingAnswerUuid = randomUUID()

      await request()
        .patch(apiRoutes.answers.update(nonExistingAnswerUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Missing entity patch',
        })
        .expect(404)
    })

    it('PATCH /api/answers/:id with invalid body should return 400', async () => {
      const createdAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'Answer before invalid patch',
      })

      await request()
        .patch(apiRoutes.answers.update(createdAnswer.id))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: '',
        })
        .expect(400)
    })

    it('PATCH /api/answers/:id with user token should update an answer', async () => {
      const createdAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'Answer before patch',
      })

      const updatedAnswer = await updateAnswer(request, userToken, createdAnswer.id, {
        answerText: 'Answer after patch',
      })

      expect(updatedAnswer).toEqual(
        expect.objectContaining({
          id: createdAnswer.id,
          answerText: 'Answer after patch',
        }),
      )
    })

    it('DELETE /api/answers/:id with invalid uuid should return 400', async () => {
      await request()
        .delete(apiRoutes.answers.remove(invalidUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })

    it('DELETE /api/answers/:id with valid non-existing uuid should return deleted: false', async () => {
      const nonExistingAnswerUuid = randomUUID()

      const response = await request()
        .delete(apiRoutes.answers.remove(nonExistingAnswerUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toEqual({
        deleted: false,
      })
    })

    it('DELETE /api/answers/:id with admin token should delete an answer', async () => {
      const createdAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'Answer before delete',
      })

      const deleteResponse = await request()
        .delete(apiRoutes.answers.remove(createdAnswer.id))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(deleteResponse.body).toEqual({
        deleted: true,
      })

      await request().get(apiRoutes.answers.byId(createdAnswer.id)).expect(404)
    })

    it('PATCH /api/answers/:id/mark-best with invalid uuid should return 400', async () => {
      await request()
        .patch(apiRoutes.answers.markBest(invalidUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })

    it('PATCH /api/answers/:id/mark-best with valid non-existing uuid should return 404', async () => {
      const nonExistingAnswerUuid = randomUUID()

      await request()
        .patch(apiRoutes.answers.markBest(nonExistingAnswerUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
    })

    it('PATCH /api/answers/:id/mark-best with user token should return 403', async () => {
      const createdAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'Answer for forbidden mark-best',
      })

      await request()
        .patch(apiRoutes.answers.markBest(createdAnswer.id))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
    })

    it('PATCH /api/answers/:id/mark-best with admin token should keep exactly one best answer', async () => {
      const firstAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'First answer for mark-best',
      })

      const secondAnswer = await createAnswer(request, userToken, questionId, {
        answerText: 'Second answer for mark-best',
      })

      await request()
        .patch(apiRoutes.answers.markBest(firstAnswer.id))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      let answersListResponse = await request()
        .get(apiRoutes.questions.answers(questionId))
        .expect(200)

      expect(Array.isArray(answersListResponse.body)).toBe(true)

      let bestAnswers = answersListResponse.body.filter(
        (answer: { isBest: boolean }) => answer.isBest,
      )

      expect(bestAnswers).toHaveLength(1)
      expect(bestAnswers[0].id).toBe(firstAnswer.id)

      await request()
        .patch(apiRoutes.answers.markBest(secondAnswer.id))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      const firstAnswerResponse = await request()
        .get(apiRoutes.answers.byId(firstAnswer.id))
        .expect(200)

      const secondAnswerResponse = await request()
        .get(apiRoutes.answers.byId(secondAnswer.id))
        .expect(200)

      expect(firstAnswerResponse.body.isBest).toBe(false)
      expect(secondAnswerResponse.body.isBest).toBe(true)

      answersListResponse = await request().get(apiRoutes.questions.answers(questionId)).expect(200)

      expect(Array.isArray(answersListResponse.body)).toBe(true)

      bestAnswers = answersListResponse.body.filter((answer: { isBest: boolean }) => answer.isBest)

      expect(bestAnswers).toHaveLength(1)
      expect(bestAnswers[0].id).toBe(secondAnswer.id)
    })
  })
})
