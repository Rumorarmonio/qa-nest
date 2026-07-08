import { randomUUID } from 'node:crypto'

import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/e2e/api/api-routes'
import { testRoute } from '@test/e2e/api/test-route'
import { createE2eHelpers } from '@test/e2e/helpers/e2e.helpers'
import { setupE2e } from '@test/e2e/helpers/setup-e2e'

const { questions } = apiRoutes

describe('Questions (e2e)', () => {
  const { request } = setupE2e()
  const helpers = createE2eHelpers(request)

  let userToken: string
  let otherUserToken: string
  let adminToken: string

  const invalidUuid = 'not-a-uuid'

  beforeAll(async () => {
    const userLoginResponse = await helpers.auth.loginAsUser()
    const otherUserLoginResponse = await helpers.auth.loginAs(seedUsers.user2)
    const adminLoginResponse = await helpers.auth.loginAsAdmin()

    userToken = userLoginResponse.accessToken
    otherUserToken = otherUserLoginResponse.accessToken
    adminToken = adminLoginResponse.accessToken
  })

  describe('Public', () => {
    testRoute(questions.list, 'should return paginated questions list', async () => {
      const response = await request().get(questions.list.build()).expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          items: expect.any(Array),
          pagination: expect.objectContaining({
            page: expect.any(Number),
            limit: expect.any(Number),
            total: expect.any(Number),
            totalPages: expect.any(Number),
          }),
        }),
      )
    })

    testRoute(
      questions.list,
      'with page=1 and limit=5 should return no more than 5 items',
      async () => {
        const response = await request()
          .get(questions.list.build({ page: 1, limit: 5 }))
          .expect(200)

        expect(response.body.pagination).toEqual(
          expect.objectContaining({
            page: 1,
            limit: 5,
          }),
        )

        expect(Array.isArray(response.body.items)).toBe(true)
        expect(response.body.items.length).toBeLessThanOrEqual(5)
      },
    )

    testRoute(
      questions.list,
      'with includeAnswers=true should return paginated questions list',
      async () => {
        const response = await request()
          .get(questions.list.build({ includeAnswers: true }))
          .expect(200)

        expect(response.body).toEqual(
          expect.objectContaining({
            items: expect.any(Array),
            pagination: expect.objectContaining({
              page: expect.any(Number),
              limit: expect.any(Number),
              total: expect.any(Number),
              totalPages: expect.any(Number),
            }),
          }),
        )
      },
    )

    testRoute(
      questions.list,
      'with includeAnswers=true and answersLimit=1 should limit nested answers',
      async () => {
        const response = await request()
          .get(
            questions.list.build({
              includeAnswers: true,
              answersLimit: 1,
            }),
          )
          .expect(200)

        expect(response.body).toEqual(
          expect.objectContaining({
            items: expect.any(Array),
            pagination: expect.objectContaining({
              page: expect.any(Number),
              limit: expect.any(Number),
              total: expect.any(Number),
              totalPages: expect.any(Number),
            }),
          }),
        )

        for (const question of response.body.items) {
          if (Array.isArray(question.answers)) {
            expect(question.answers.length).toBeLessThanOrEqual(1)
          }
        }
      },
    )

    testRoute(questions.getById, 'should return question by id', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question for get by id',
        questionText: 'Question text for get by id',
      })

      const response = await request().get(questions.getById.build(createdQuestion.id)).expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdQuestion.id,
          title: 'Question for get by id',
          questionText: 'Question text for get by id',
        }),
      )
    })

    testRoute(questions.getById, 'with invalid uuid should return 400', async () => {
      await request().get(questions.getById.build(invalidUuid)).expect(400)
    })

    testRoute(questions.getById, 'with valid non-existing uuid should return 404', async () => {
      const nonExistingUuid = randomUUID()

      await request().get(questions.getById.build(nonExistingUuid)).expect(404)
    })

    testRoute(questions.list, 'with page=0 should return 400', async () => {
      await request()
        .get(questions.list.build({ page: 0 }))
        .expect(400)
    })

    testRoute(questions.list, 'with limit=0 should return 400', async () => {
      await request()
        .get(questions.list.build({ limit: 0 }))
        .expect(400)
    })

    testRoute(questions.list, 'with limit=101 should return 400', async () => {
      await request()
        .get(questions.list.build({ limit: 101 }))
        .expect(400)
    })

    testRoute(
      questions.list,
      'with includeAnswers=true and answersLimit=0 should return 400',
      async () => {
        await request()
          .get(
            questions.list.build({
              includeAnswers: true,
              answersLimit: 0,
            }),
          )
          .expect(400)
      },
    )

    testRoute(
      questions.list,
      'with includeAnswers=true and answersLimit=101 should return 400',
      async () => {
        await request()
          .get(
            questions.list.build({
              includeAnswers: true,
              answersLimit: 101,
            }),
          )
          .expect(400)
      },
    )
  })

  describe('Protected', () => {
    testRoute(questions.create, 'without token should return 401', async () => {
      await request()
        .post(questions.create.path)
        .send({
          title: 'Unauthorized question',
          questionText: 'Should not be created',
        })
        .expect(401)
    })

    testRoute(questions.create, 'with invalid body should return 400', async () => {
      await request()
        .post(questions.create.path)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          questionText: '',
        })
        .expect(400)
    })

    testRoute(questions.create, 'with user token should create a question', async () => {
      const response = await request()
        .post(questions.create.path)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Created from e2e',
          questionText: 'Question created in questions.e2e-spec.ts',
        })
        .expect(201)

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          authorId: expect.any(String),
          author: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
          title: 'Created from e2e',
          questionText: 'Question created in questions.e2e-spec.ts',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      )
    })

    testRoute(questions.update, 'without token should return 401', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question for unauthorized patch',
        questionText: 'Before unauthorized patch',
      })

      await request()
        .patch(questions.update.build(createdQuestion.id))
        .send({
          title: 'Unauthorized patch title',
        })
        .expect(401)
    })

    testRoute(questions.update, 'with invalid uuid should return 400', async () => {
      await request()
        .patch(questions.update.build(invalidUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid uuid patch',
        })
        .expect(400)
    })

    testRoute(questions.update, 'with valid non-existing uuid should return 404', async () => {
      const nonExistingUuid = randomUUID()

      await request()
        .patch(questions.update.build(nonExistingUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Missing entity patch',
        })
        .expect(404)
    })

    testRoute(questions.update, 'with invalid body should return 400', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question before invalid patch',
        questionText: 'Question text before invalid patch',
      })

      await request()
        .patch(questions.update.build(createdQuestion.id))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          questionText: '',
        })
        .expect(400)
    })

    testRoute(questions.update, 'with user token should update a question', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question before patch',
        questionText: 'Question text before patch',
      })

      const updatedQuestion = await helpers.questions.updateQuestion(userToken, createdQuestion.id, {
        title: 'Question after patch',
        questionText: 'Question text after patch',
      })

      expect(updatedQuestion).toEqual(
        expect.objectContaining({
          id: createdQuestion.id,
          title: 'Question after patch',
          questionText: 'Question text after patch',
        }),
      )
    })

    testRoute(questions.update, 'with another user token should return 403', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question before forbidden patch',
        questionText: 'Question text before forbidden patch',
      })

      await request()
        .patch(questions.update.build(createdQuestion.id))
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          title: 'Forbidden patch title',
        })
        .expect(403)
    })

    testRoute(questions.remove, 'without token should return 401', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question for unauthorized delete',
        questionText: 'Before unauthorized delete',
      })

      await request().delete(questions.remove.build(createdQuestion.id)).expect(401)
    })

    testRoute(questions.remove, 'with invalid uuid should return 400', async () => {
      await request()
        .delete(questions.remove.build(invalidUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })

    testRoute(
      questions.remove,
      'with valid non-existing uuid should return deleted: false',
      async () => {
        const nonExistingUuid = randomUUID()

        const response = await request()
          .delete(questions.remove.build(nonExistingUuid))
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body).toEqual({
          deleted: false,
        })
      },
    )

    testRoute(questions.remove, 'with admin token should delete a question', async () => {
      const createdQuestion = await helpers.questions.createQuestion(userToken, {
        title: 'Question before delete',
        questionText: 'Question text before delete',
      })

      const deleteResponse = await request()
        .delete(questions.remove.build(createdQuestion.id))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(deleteResponse.body).toEqual({
        deleted: true,
      })

      await request().get(questions.getById.build(createdQuestion.id)).expect(404)
    })
  })
})
