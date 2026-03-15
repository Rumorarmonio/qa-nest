import type { AnyRoute } from '@test/e2e/api/api-route.types'

type TestCallback = Parameters<typeof it>[1]

type TestRoute = {
  (route: AnyRoute, description: string, testFn: TestCallback): void
  only: (route: AnyRoute, description: string, testFn: TestCallback) => void
  skip: (route: AnyRoute, description: string, testFn: TestCallback) => void
}

function buildRouteTestName(route: AnyRoute, description: string): string {
  return `${route.method} ${route.pattern} ${description}`
}

function runRouteTest(
  runner: typeof it,
  route: AnyRoute,
  description: string,
  testFn: TestCallback,
): void {
  runner(buildRouteTestName(route, description), testFn)
}

export const testRoute: TestRoute = Object.assign(
  (route: AnyRoute, description: string, testFn: TestCallback) => {
    runRouteTest(it, route, description, testFn)
  },
  {
    only: (route: AnyRoute, description: string, testFn: TestCallback) => {
      runRouteTest(it.only, route, description, testFn)
    },

    skip: (route: AnyRoute, description: string, testFn: TestCallback) => {
      runRouteTest(it.skip, route, description, testFn)
    },
  },
)
