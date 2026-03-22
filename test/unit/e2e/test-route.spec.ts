import type { AnyRoute } from '@test/e2e/api/api-route.types'
import { testRoute } from '@test/e2e/api/test-route'

describe('testRoute', () => {
  const route: AnyRoute = {
    method: 'GET',
    pattern: '/api/questions',
    path: '/api/questions',
  }

  const testFn = jest.fn()

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call it with composed route test name', () => {
    const itSpy = jest.spyOn(global, 'it').mockImplementation(jest.fn() as never)

    testRoute(route, 'should return questions list', testFn)

    expect(itSpy).toHaveBeenCalledWith('GET /api/questions should return questions list', testFn)
  })

  it('should call it.only with composed route test name', () => {
    const onlySpy = jest.spyOn(it, 'only').mockImplementation(jest.fn() as never)

    testRoute.only(route, 'should return questions list', testFn)

    expect(onlySpy).toHaveBeenCalledWith('GET /api/questions should return questions list', testFn)
  })

  it('should call it.skip with composed route test name', () => {
    const skipSpy = jest.spyOn(it, 'skip').mockImplementation(jest.fn() as never)

    testRoute.skip(route, 'should return questions list', testFn)

    expect(skipSpy).toHaveBeenCalledWith('GET /api/questions should return questions list', testFn)
  })
})
