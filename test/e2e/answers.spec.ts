import { randomUUID } from 'node:crypto'

import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/e2e/api/api-routes'
import { testRoute } from '@test/e2e/api/test-route'
import { createE2eHelpers } from '@test/e2e/helpers/e2e.helpers'
import { createE2eLabel } from '@test/e2e/helpers/e2e-data.helper'
import { setupE2e } from '@test/e2e/helpers/setup-e2e'

const { questions, answers } = apiRoutes

describe('Answers (e2e)', () => {
  const { request } = setupE2e()
  const helpers = createE2eHelpers(request)

  let userToken: string
  let otherUserToken: string
  let adminToken: string
  let questionId: string

  const invalidUuid = 'not-a-uuid'

  beforeAll(async () => {
    const userLoginResponse = await helpers.auth.loginAsUser()
    const otherUserLoginResponse = await helpers.auth.loginAs(seedUsers.user2)
    const adminLoginResponse = await helpers.auth.loginAsAdmin()

    userToken = userLoginResponse.accessToken
    otherUserToken = otherUserLoginResponse.accessToken
    adminToken = adminLoginResponse.accessToken

    const createdQuestion = await helpers.questions.createQuestion(userToken, {
      title: createE2eLabel('Question for answers e2e'),
      questionText: 'Question text for answers e2e',
    })

    questionId = createdQuestion.id
  })

  describe('Public', () => {
    testRoute(questions.getAnswers, 'should return answers list', async () => {
      const response = await request().get(questions.getAnswers.build(questionId)).expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    testRoute(questions.getAnswers, 'with invalid uuid should return 400', async () => {
      await request().get(questions.getAnswers.build(invalidUuid)).expect(400)
    })

    testRoute(questions.getAnswers, 'with valid non-existing uuid should return 404', async () => {
      const nonExistingQuestionUuid = randomUUID()

      await request().get(questions.getAnswers.build(nonExistingQuestionUuid)).expect(404)
    })

    testRoute(answers.getById, 'should return answer by id', async () => {
      const createdAnswer = await helpers.answers.createAnswer(userToken, questionId, {
        answerText: 'Answer for get by id',
      })

      const response = await request().get(answers.getById.build(createdAnswer.id)).expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdAnswer.id,
          questionId,
          answerText: 'Answer for get by id',
        }),
      )
    })

    testRoute(answers.getById, 'with invalid uuid should return 400', async () => {
      await request().get(answers.getById.build(invalidUuid)).expect(400)
    })

    testRoute(answers.getById, 'with valid non-existing uuid should return 404', async () => {
      const nonExistingAnswerUuid = randomUUID()

      await request().get(answers.getById.build(nonExistingAnswerUuid)).expect(404)
    })
  })

  describe('Protected', () => {
    testRoute(questions.createAnswer, 'without token should return 401', async () => {
      await request()
        .post(questions.createAnswer.build(questionId))
        .send({
          answerText: 'Unauthorized answer',
        })
        .expect(401)
    })

    testRoute(questions.createAnswer, 'with invalid question uuid should return 400', async () => {
      await request()
        .post(questions.createAnswer.build(invalidUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Invalid question uuid',
        })
        .expect(400)
    })

    testRoute(
      questions.createAnswer,
      'with valid non-existing question uuid should return 404',
      async () => {
        const nonExistingQuestionUuid = randomUUID()

        await request()
          .post(questions.createAnswer.build(nonExistingQuestionUuid))
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            answerText: 'Missing question entity',
          })
          .expect(404)
      },
    )

    testRoute(questions.createAnswer, 'with invalid body should return 400', async () => {
      await request()
        .post(questions.createAnswer.build(questionId))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: '',
        })
        .expect(400)
    })

    testRoute(questions.createAnswer, 'with user token should create an answer', async () => {
      const response = await request()
        .post(questions.createAnswer.build(questionId))
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

    testRoute(answers.update, 'with invalid uuid should return 400', async () => {
      await request()
        .patch(answers.update.build(invalidUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Invalid uuid patch',
        })
        .expect(400)
    })

    testRoute(answers.update, 'with valid non-existing uuid should return 404', async () => {
      const nonExistingAnswerUuid = randomUUID()

      await request()
        .patch(answers.update.build(nonExistingAnswerUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: 'Missing entity patch',
        })
        .expect(404)
    })

    testRoute(answers.update, 'with invalid body should return 400', async () => {
      const createdAnswer = await helpers.answers.createAnswer(userToken, questionId, {
        answerText: 'Answer before invalid patch',
      })

      await request()
        .patch(answers.update.build(createdAnswer.id))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          answerText: '',
        })
        .expect(400)
    })

    testRoute(answers.update, 'with user token should update an answer', async () => {
      const createdAnswer = await helpers.answers.createAnswer(userToken, questionId, {
        answerText: 'Answer before patch',
      })

      const updatedAnswer = await helpers.answers.updateAnswer(userToken, createdAnswer.id, {
        answerText: 'Answer after patch',
      })

      expect(updatedAnswer).toEqual(
        expect.objectContaining({
          id: createdAnswer.id,
          answerText: 'Answer after patch',
        }),
      )
    })

    testRoute(answers.update, 'with another user token should return 403', async () => {
      const createdAnswer = await helpers.answers.createAnswer(userToken, questionId, {
        answerText: 'Answer before forbidden patch',
      })

      await request()
        .patch(answers.update.build(createdAnswer.id))
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          answerText: 'Forbidden answer patch',
        })
        .expect(403)
    })

    testRoute(answers.remove, 'with invalid uuid should return 400', async () => {
      await request()
        .delete(answers.remove.build(invalidUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })

    testRoute(
      answers.remove,
      'with valid non-existing uuid should return deleted: false',
      async () => {
        const nonExistingAnswerUuid = randomUUID()

        const response = await request()
          .delete(answers.remove.build(nonExistingAnswerUuid))
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body).toEqual({
          deleted: false,
        })
      },
    )

    testRoute(answers.remove, 'with admin token should delete an answer', async () => {
      const createdAnswer = await helpers.answers.createAnswer(userToken, questionId, {
        answerText: 'Answer before delete',
      })

      const deleteResponse = await request()
        .delete(answers.remove.build(createdAnswer.id))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(deleteResponse.body).toEqual({
        deleted: true,
      })

      await request().get(answers.getById.build(createdAnswer.id)).expect(404)
    })

    testRoute(answers.markBest, 'with invalid uuid should return 400', async () => {
      await request()
        .patch(answers.markBest.build(invalidUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })

    testRoute(answers.markBest, 'with valid non-existing uuid should return 404', async () => {
      const nonExistingAnswerUuid = randomUUID()

      await request()
        .patch(answers.markBest.build(nonExistingAnswerUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
    })

    testRoute(answers.markBest, 'with user token should return 403', async () => {
      const createdAnswer = await helpers.answers.createAnswer(userToken, questionId, {
        answerText: 'Answer for forbidden mark-best',
      })

      await request()
        .patch(answers.markBest.build(createdAnswer.id))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
    })

    testRoute(
      answers.markBest,
      'with admin token should keep exactly one best answer',
      async () => {
        const firstAnswer = await helpers.answers.createAnswer(userToken, questionId, {
          answerText: 'First answer for mark-best',
        })

        const secondAnswer = await helpers.answers.createAnswer(userToken, questionId, {
          answerText: 'Second answer for mark-best',
        })

        await request()
          .patch(answers.markBest.build(firstAnswer.id))
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        let answersListResponse = await request()
          .get(questions.getAnswers.build(questionId))
          .expect(200)

        expect(Array.isArray(answersListResponse.body)).toBe(true)

        let bestAnswers = answersListResponse.body.filter(
          (answer: { isBest: boolean }) => answer.isBest,
        )

        expect(bestAnswers).toHaveLength(1)
        expect(bestAnswers[0].id).toBe(firstAnswer.id)

        await request()
          .patch(answers.markBest.build(secondAnswer.id))
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        const firstAnswerResponse = await request()
          .get(answers.getById.build(firstAnswer.id))
          .expect(200)

        const secondAnswerResponse = await request()
          .get(answers.getById.build(secondAnswer.id))
          .expect(200)

        expect(firstAnswerResponse.body.isBest).toBe(false)
        expect(secondAnswerResponse.body.isBest).toBe(true)

        answersListResponse = await request()
          .get(questions.getAnswers.build(questionId))
          .expect(200)

        expect(Array.isArray(answersListResponse.body)).toBe(true)

        bestAnswers = answersListResponse.body.filter(
          (answer: { isBest: boolean }) => answer.isBest,
        )

        expect(bestAnswers).toHaveLength(1)
        expect(bestAnswers[0].id).toBe(secondAnswer.id)
      },
    )
  })
})
