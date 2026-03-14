import { apiRoutes } from '@test/constants/api-routes'
import { setupE2e } from '@test/helpers/setup-e2e'

describe('Questions (e2e)', () => {
  const { request } = setupE2e()

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
})
