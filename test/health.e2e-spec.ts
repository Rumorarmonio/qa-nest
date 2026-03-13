import { apiRoutes } from '@test/constants/api-routes'
import { setupE2e } from '@test/helpers/setup-e2e'

describe('Health (e2e)', () => {
  const { request } = setupE2e()

  it('GET /api/health should return 200', async () => {
    await request().get(apiRoutes.health).expect(200)
  })
})
