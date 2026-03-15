import { createStaticRoute } from '@test/e2e/api/api-route.utils'

export const authRoutes = {
  register: createStaticRoute('POST', '/auth/register'),
  login: createStaticRoute('POST', '/auth/login'),
  me: createStaticRoute('GET', '/auth/me'),
}
