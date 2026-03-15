import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/e2e/api/api-routes'
import { setupE2e } from '@test/e2e/helpers/setup-e2e'

export type RequestFactory = ReturnType<typeof setupE2e>['request']

type LoginResponseBody = {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

const { auth } = apiRoutes

async function login(
  request: RequestFactory,
  credentials: {
    email: string
    password: string
  },
): Promise<LoginResponseBody> {
  const response = await request()
    .post(auth.login.path)
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
