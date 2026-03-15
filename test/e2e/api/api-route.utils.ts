import { API_PREFIX_PATH } from '@/shared/constants/api'

import type { DynamicRoute, HttpMethod, StaticRoute } from '@test/e2e/api/api-route.types'

type PrimitiveQueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, PrimitiveQueryValue>

function withApiPrefix(path: string): string {
  return `${API_PREFIX_PATH}${path}`
}

export function buildUrl(path: string, query?: QueryParams): string {
  if (!query) {
    return path
  }

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()

  if (!queryString) {
    return path
  }

  return `${path}?${queryString}`
}

export function createStaticRoute(method: HttpMethod, relativePath: string): StaticRoute {
  const fullPath = withApiPrefix(relativePath)

  return {
    method,
    pattern: fullPath,
    path: fullPath,
  }
}

export function createDynamicRoute<Args extends unknown[]>(
  method: HttpMethod,
  relativePattern: string,
  buildRelativePath: (...args: Args) => string,
): DynamicRoute<Args> {
  const fullPattern = withApiPrefix(relativePattern)

  return {
    method,
    pattern: fullPattern,
    build: (...args: Args) => withApiPrefix(buildRelativePath(...args)),
  }
}
