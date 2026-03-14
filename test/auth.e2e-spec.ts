import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/constants/api-routes'
import { loginAsAdmin, loginAsUser } from '@test/helpers/auth.helper'
import { setupE2e } from '@test/helpers/setup-e2e'

describe('Auth (e2e)', () => {
  const { request } = setupE2e()

  it('POST /api/auth/login should login seeded user', async () => {
    const response = await request()
      .post(apiRoutes.auth.login)
      .send({
        email: seedUsers.user1.email,
        password: seedUsers.user1.password,
      })
      .expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: seedUsers.user1.email,
          name: seedUsers.user1.name,
          role: seedUsers.user1.role,
        }),
      }),
    )
  })

  it('POST /api/auth/login should login seeded admin', async () => {
    const response = await request()
      .post(apiRoutes.auth.login)
      .send({
        email: seedUsers.admin.email,
        password: seedUsers.admin.password,
      })
      .expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: seedUsers.admin.email,
          name: seedUsers.admin.name,
          role: seedUsers.admin.role,
        }),
      }),
    )
  })

  it('GET /api/auth/me should return current seeded user', async () => {
    const loginResponse = await loginAsUser(request)

    const response = await request()
      .get(apiRoutes.auth.me)
      .set('Authorization', `Bearer ${loginResponse.accessToken}`)
      .expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: seedUsers.user1.email,
        name: seedUsers.user1.name,
        role: seedUsers.user1.role,
      }),
    )
  })

  it('GET /api/auth/me should return current seeded admin', async () => {
    const loginResponse = await loginAsAdmin(request)

    const response = await request()
      .get(apiRoutes.auth.me)
      .set('Authorization', `Bearer ${loginResponse.accessToken}`)
      .expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: seedUsers.admin.email,
        name: seedUsers.admin.name,
        role: seedUsers.admin.role,
      }),
    )
  })

  it('GET /api/auth/me without token should return 401', async () => {
    await request().get(apiRoutes.auth.me).expect(401)
  })

  it('POST /api/auth/login with wrong password should return 401', async () => {
    await request()
      .post(apiRoutes.auth.login)
      .send({
        email: seedUsers.user1.email,
        password: 'WrongPassword123!',
      })
      .expect(401)
  })

  it('POST /api/auth/register should create a new user', async () => {
    const uniqueSuffix = Date.now()

    const registerPayload = {
      name: `E2E User ${uniqueSuffix}`,
      email: `e2e-user-${uniqueSuffix}@example.com`,
      password: 'Password123!',
    }

    const response = await request().post(apiRoutes.auth.register).send(registerPayload).expect(201)

    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: registerPayload.email,
          name: registerPayload.name,
          role: 'USER',
        }),
      }),
    )
  })

  it('POST /api/auth/register with existing email should return 409', async () => {
    await request()
      .post(apiRoutes.auth.register)
      .send({
        name: 'Duplicate User',
        email: seedUsers.user1.email,
        password: 'Password123!',
      })
      .expect(409)
  })
})
