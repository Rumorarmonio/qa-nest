import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { API_PREFIX } from '@test/constants/api-routes'
import { AppModule } from '@/app.module'

type SetupE2eOptions = {
  useApiPrefix?: boolean
}

export function setupE2e(options: SetupE2eOptions = {}) {
  const { useApiPrefix = true } = options

  let app: INestApplication

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = testingModule.createNestApplication()

    if (useApiPrefix) {
      app.setGlobalPrefix(API_PREFIX)
    }

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  return {
    getApp: () => app,
    request: () => request(app.getHttpServer()),
  }
}
