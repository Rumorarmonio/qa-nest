import { API_PREFIX_PATH } from '@/shared/constants/api'

import { buildUrl, createDynamicRoute, createStaticRoute } from '@test/e2e/api/api-route.utils'

describe('api-route.utils', () => {
  describe('buildUrl', () => {
    it('should return path as is when query is not provided', () => {
      expect(buildUrl('/questions')).toBe('/questions')
    })

    it('should return path as is when query is empty', () => {
      expect(buildUrl('/questions', {})).toBe('/questions')
    })

    it('should append primitive query params', () => {
      expect(
        buildUrl('/questions', {
          page: 1,
          limit: 10,
          includeAnswers: true,
        }),
      ).toBe('/questions?page=1&limit=10&includeAnswers=true')
    })

    it('should skip undefined and null query params', () => {
      expect(
        buildUrl('/questions', {
          page: 1,
          limit: undefined,
          includeAnswers: null,
          answersLimit: 2,
        }),
      ).toBe('/questions?page=1&answersLimit=2')
    })

    it('should stringify boolean false and zero correctly', () => {
      expect(
        buildUrl('/questions', {
          includeAnswers: false,
          page: 0,
        }),
      ).toBe('/questions?includeAnswers=false&page=0')
    })
  })

  describe('createStaticRoute', () => {
    it('should create static route with prefixed path and pattern', () => {
      const route = createStaticRoute('GET', '/health')

      expect(route).toEqual({
        method: 'GET',
        pattern: `${API_PREFIX_PATH}/health`,
        path: `${API_PREFIX_PATH}/health`,
      })
    })
  })

  describe('createDynamicRoute', () => {
    it('should create dynamic route with prefixed pattern', () => {
      const route = createDynamicRoute('GET', '/questions/:id', (id: string) => `/questions/${id}`)

      expect(route.method).toBe('GET')
      expect(route.pattern).toBe(`${API_PREFIX_PATH}/questions/:id`)
    })

    it('should build prefixed dynamic path', () => {
      const route = createDynamicRoute('GET', '/questions/:id', (id: string) => `/questions/${id}`)

      expect(route.build('question-123')).toBe(`${API_PREFIX_PATH}/questions/question-123`)
    })

    it('should support dynamic route builders with query params', () => {
      const route = createDynamicRoute(
        'GET',
        '/questions',
        (query?: { page?: number; limit?: number }) => buildUrl('/questions', query),
      )

      expect(route.build({ page: 2, limit: 5 })).toBe(`${API_PREFIX_PATH}/questions?page=2&limit=5`)
    })
  })
})
