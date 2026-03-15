import { createStaticRoute } from '@test/e2e/api/api-route.utils'

export const healthRoutes = {
  check: createStaticRoute('GET', '/health'),
}
