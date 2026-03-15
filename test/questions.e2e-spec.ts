import { randomUUID } from 'node:crypto'

import { apiRoutes } from '@test/constants/api-routes'
import { loginAsAdmin, loginAsUser } from '@test/helpers/auth.helper'
import { createQuestion, updateQuestion } from '@test/helpers/questions.helper'
import { setupE2e } from '@test/helpers/setup-e2e'

describe('Questions (e2e)', () => {
  const { request } = setupE2e()

  let userToken: string
  let adminToken: string

  const invalidUuid = 'not-a-uuid'

  beforeAll(async () => {
    const userLoginResponse = await loginAsUser(request)
    const adminLoginResponse = await loginAsAdmin(request)

    userToken = userLoginResponse.accessToken
    adminToken = adminLoginResponse.accessToken
  })

  describe('Public', () => {
    it('GET /api/questions should return paginated questions list', async () => {
      const response = await request().get(apiRoutes.questions.list()).expect(200)

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

    it('GET /api/questions?page=1&limit=5 should return no more than 5 items', async () => {
      const response = await request()
        .get(apiRoutes.questions.list({ page: 1, limit: 5 }))
        .expect(200)

      expect(response.body.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 5,
        }),
      )

      expect(Array.isArray(response.body.items)).toBe(true)
      expect(response.body.items.length).toBeLessThanOrEqual(5)
    })

    it('GET /api/questions?includeAnswers=true should return paginated questions list', async () => {
      const response = await request()
        .get(apiRoutes.questions.list({ includeAnswers: true }))
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
    })

    it('GET /api/questions?includeAnswers=true&answersLimit=1 should limit nested answers', async () => {
      const response = await request()
        .get(
          apiRoutes.questions.list({
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
    })

    it('GET /api/questions/:id should return question by id', async () => {
      const createdQuestion = await createQuestion(request, userToken, {
        title: 'Question for get by id',
        questionText: 'Question text for get by id',
      })

      const response = await request().get(apiRoutes.questions.byId(createdQuestion.id)).expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdQuestion.id,
          title: 'Question for get by id',
          questionText: 'Question text for get by id',
        }),
      )
    })

    it('GET /api/questions/:id with invalid uuid should return 400', async () => {
      await request().get(apiRoutes.questions.byId(invalidUuid)).expect(400)
    })

    it('GET /api/questions/:id with valid non-existing uuid should return 404', async () => {
      const nonExistingUuid = randomUUID()

      await request().get(apiRoutes.questions.byId(nonExistingUuid)).expect(404)
    })

    it('GET /api/questions?page=0 should return 400', async () => {
      await request()
        .get(apiRoutes.questions.list({ page: 0 }))
        .expect(400)
    })

    it('GET /api/questions?limit=0 should return 400', async () => {
      await request()
        .get(apiRoutes.questions.list({ limit: 0 }))
        .expect(400)
    })

    it('GET /api/questions?limit=101 should return 400', async () => {
      await request()
        .get(apiRoutes.questions.list({ limit: 101 }))
        .expect(400)
    })

    it('GET /api/questions?includeAnswers=true&answersLimit=0 should return 400', async () => {
      await request()
        .get(
          apiRoutes.questions.list({
            includeAnswers: true,
            answersLimit: 0,
          }),
        )
        .expect(400)
    })

    it('GET /api/questions?includeAnswers=true&answersLimit=101 should return 400', async () => {
      await request()
        .get(
          apiRoutes.questions.list({
            includeAnswers: true,
            answersLimit: 101,
          }),
        )
        .expect(400)
    })
  })

  describe('Protected', () => {
    it('POST /api/questions without token should return 401', async () => {
      await request()
        .post(apiRoutes.questions.create)
        .send({
          title: 'Unauthorized question',
          questionText: 'Should not be created',
        })
        .expect(401)
    })

    it('POST /api/questions with invalid body should return 400', async () => {
      await request()
        .post(apiRoutes.questions.create)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          questionText: '',
        })
        .expect(400)
    })

    it('POST /api/questions with user token should create a question', async () => {
      const response = await request()
        .post(apiRoutes.questions.create)
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

    it('PATCH /api/questions/:id without token should return 401', async () => {
      const createdQuestion = await createQuestion(request, userToken, {
        title: 'Question for unauthorized patch',
        questionText: 'Before unauthorized patch',
      })

      await request()
        .patch(apiRoutes.questions.update(createdQuestion.id))
        .send({
          title: 'Unauthorized patch title',
        })
        .expect(401)
    })

    it('PATCH /api/questions/:id with invalid uuid should return 400', async () => {
      await request()
        .patch(apiRoutes.questions.update(invalidUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid uuid patch',
        })
        .expect(400)
    })

    it('PATCH /api/questions/:id with valid non-existing uuid should return 404', async () => {
      const nonExistingUuid = randomUUID()

      await request()
        .patch(apiRoutes.questions.update(nonExistingUuid))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Missing entity patch',
        })
        .expect(404)
    })

    it('PATCH /api/questions/:id with invalid body should return 400', async () => {
      const createdQuestion = await createQuestion(request, userToken, {
        title: 'Question before invalid patch',
        questionText: 'Question text before invalid patch',
      })

      await request()
        .patch(apiRoutes.questions.update(createdQuestion.id))
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          questionText: '',
        })
        .expect(400)
    })

    it('PATCH /api/questions/:id with user token should update a question', async () => {
      const createdQuestion = await createQuestion(request, userToken, {
        title: 'Question before patch',
        questionText: 'Question text before patch',
      })

      const updatedQuestion = await updateQuestion(request, userToken, createdQuestion.id, {
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

    it('DELETE /api/questions/:id without token should return 401', async () => {
      const createdQuestion = await createQuestion(request, userToken, {
        title: 'Question for unauthorized delete',
        questionText: 'Before unauthorized delete',
      })

      await request().delete(apiRoutes.questions.remove(createdQuestion.id)).expect(401)
    })

    it('DELETE /api/questions/:id with invalid uuid should return 400', async () => {
      await request()
        .delete(apiRoutes.questions.remove(invalidUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
    })

    it('DELETE /api/questions/:id with valid non-existing uuid should return deleted: false', async () => {
      const nonExistingUuid = randomUUID()

      const response = await request()
        .delete(apiRoutes.questions.remove(nonExistingUuid))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toEqual({
        deleted: false,
      })
    })

    it('DELETE /api/questions/:id with admin token should delete a question', async () => {
      const createdQuestion = await createQuestion(request, userToken, {
        title: 'Question before delete',
        questionText: 'Question text before delete',
      })

      const deleteResponse = await request()
        .delete(apiRoutes.questions.remove(createdQuestion.id))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(deleteResponse.body).toEqual({
        deleted: true,
      })

      await request().get(apiRoutes.questions.byId(createdQuestion.id)).expect(404)
    })
  })
})
