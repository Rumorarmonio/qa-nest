import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/constants/api-routes'
import { setupE2e } from '@test/helpers/setup-e2e'

type RequestFactory = ReturnType<typeof setupE2e>['request']

type LoginResponseBody = {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

async function login(
  request: RequestFactory,
  credentials: {
    email: string
    password: string
  },
): Promise<LoginResponseBody> {
  const response = await request()
    .post(apiRoutes.auth.login)
    .send({
      email: credentials.email,
      password: credentials.password,
    })
    .expect(200)

  return response.body as LoginResponseBody
}

export async function loginAsAdmin(request: RequestFactory): Promise<LoginResponseBody> {
  return login(request, {
    email: seedUsers.admin.email,
    password: seedUsers.admin.password,
  })
}

export async function loginAsUser(request: RequestFactory): Promise<LoginResponseBody> {
  return login(request, {
    email: seedUsers.user1.email,
    password: seedUsers.user1.password,
  })
}
