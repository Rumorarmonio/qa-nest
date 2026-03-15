import {
  buildUrl,
  createDynamicRoute,
  createStaticRoute,
} from '@test/e2e/api/api-route.utils'

export type QuestionsListQuery = {
  page?: number
  limit?: number
  includeAnswers?: boolean
  answersLimit?: number
}

export const questionsRoutes = {
  list: createDynamicRoute('GET', '/questions', (query?: QuestionsListQuery) => {
    return buildUrl('/questions', query)
  }),

  getById: createDynamicRoute('GET', '/questions/:id', (id: string) => `/questions/${id}`),

  create: createStaticRoute('POST', '/questions'),

  update: createDynamicRoute('PATCH', '/questions/:id', (id: string) => `/questions/${id}`),

  remove: createDynamicRoute('DELETE', '/questions/:id', (id: string) => `/questions/${id}`),

  getAnswers: createDynamicRoute(
    'GET',
    '/questions/:questionId/answers',
    (questionId: string) => `/questions/${questionId}/answers`,
  ),

  createAnswer: createDynamicRoute(
    'POST',
    '/questions/:questionId/answers',
    (questionId: string) => `/questions/${questionId}/answers`,
  ),
}
