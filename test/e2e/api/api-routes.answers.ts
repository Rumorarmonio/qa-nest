import { createDynamicRoute } from '@test/e2e/api/api-route.utils'

export const answersRoutes = {
  getById: createDynamicRoute('GET', '/answers/:id', (id: string) => `/answers/${id}`),

  update: createDynamicRoute('PATCH', '/answers/:id', (id: string) => `/answers/${id}`),

  remove: createDynamicRoute('DELETE', '/answers/:id', (id: string) => `/answers/${id}`),

  markBest: createDynamicRoute(
    'PATCH',
    '/answers/:id/mark-best',
    (id: string) => `/answers/${id}/mark-best`,
  ),
}
