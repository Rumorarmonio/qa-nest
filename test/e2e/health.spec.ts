import { apiRoutes } from '@test/e2e/api/api-routes'
import { testRoute } from '@test/e2e/api/test-route'
import { setupE2e } from '@test/e2e/helpers/setup-e2e'

const { health } = apiRoutes

describe('Health (e2e)', () => {
  const { request } = setupE2e()

  testRoute(health.check, 'should return 200', async () => {
    await request().get(health.check.path).expect(200)
  })
})
