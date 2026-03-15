export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type StaticRoute = {
  method: HttpMethod
  pattern: string
  path: string
}

export type DynamicRoute<Args extends unknown[]> = {
  method: HttpMethod
  pattern: string
  build: (...args: Args) => string
}

export type AnyRoute = StaticRoute | DynamicRoute<unknown[]>
