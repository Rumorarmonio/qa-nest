import { seedUsers } from '@/shared/seed-data/users'
import { apiRoutes } from '@test/e2e/api/api-routes'
import { setupE2e } from '@test/e2e/helpers/setup-e2e'

export type RequestFactory = ReturnType<typeof setupE2e>['request']

export type LoginResponseUser = {
  id: string
  email: string
  name: string
  role: string
}

export type LoginResponseBody = {
  accessToken: string
  user: LoginResponseUser
}

const { auth } = apiRoutes

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginAsFn = (credentials: LoginCredentials) => Promise<LoginResponseBody>

export type AuthHelpers = {
  loginAs: LoginAsFn
  loginAsAdmin: () => Promise<LoginResponseBody>
  loginAsUser: () => Promise<LoginResponseBody>
}

export async function loginAs(
  request: RequestFactory,
  credentials: LoginCredentials,
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

async function loginAsAdmin(request: RequestFactory): Promise<LoginResponseBody> {
  return loginAs(request, {
    email: seedUsers.admin.email,
    password: seedUsers.admin.password,
  })
}

async function loginAsUser(request: RequestFactory): Promise<LoginResponseBody> {
  return loginAs(request, {
    email: seedUsers.user1.email,
    password: seedUsers.user1.password,
  })
}

export function createAuthHelpers(request: RequestFactory): AuthHelpers {
  return {
    loginAs: (credentials: LoginCredentials) => loginAs(request, credentials),
    loginAsAdmin: () => loginAsAdmin(request),
    loginAsUser: () => loginAsUser(request),
  }
}
