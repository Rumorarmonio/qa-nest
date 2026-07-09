import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/e2e/api/api-routes'
import { testRoute } from '@test/e2e/api/test-route'
import { createE2eHelpers } from '@test/e2e/helpers/e2e.helpers'
import { createE2eEmail, createE2eLabel } from '@test/e2e/helpers/e2e-data.helper'
import { setupE2e } from '@test/e2e/helpers/setup-e2e'

const { auth } = apiRoutes

describe('Auth (e2e)', () => {
  const { request } = setupE2e()
  const helpers = createE2eHelpers(request)

  testRoute(auth.login, 'should login seeded user', async () => {
    const response = await request()
      .post(auth.login.path)
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

  testRoute(auth.login, 'should login seeded admin', async () => {
    const response = await request()
      .post(auth.login.path)
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

  testRoute(auth.me, 'should return current seeded user', async () => {
    const loginResponse = await helpers.auth.loginAsUser()

    const response = await request()
      .get(auth.me.path)
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

  testRoute(auth.me, 'should return current seeded admin', async () => {
    const loginResponse = await helpers.auth.loginAsAdmin()

    const response = await request()
      .get(auth.me.path)
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

  testRoute(auth.me, 'without token should return 401', async () => {
    await request().get(auth.me.path).expect(401)
  })

  testRoute(auth.login, 'with wrong password should return 401', async () => {
    await request()
      .post(auth.login.path)
      .send({
        email: seedUsers.user1.email,
        password: 'WrongPassword123!',
      })
      .expect(401)
  })

  testRoute(auth.register, 'should create a new user', async () => {
    const uniqueSuffix = Date.now()

    const registerPayload = {
      name: createE2eLabel(`User ${uniqueSuffix}`),
      email: createE2eEmail(`user-${uniqueSuffix}`),
      password: 'Password123!',
    }

    const response = await request().post(auth.register.path).send(registerPayload).expect(201)

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

  testRoute(auth.register, 'with existing email should return 409', async () => {
    await request()
      .post(auth.register.path)
      .send({
        name: 'Duplicate User',
        email: seedUsers.user1.email,
        password: 'Password123!',
      })
      .expect(409)
  })
})
