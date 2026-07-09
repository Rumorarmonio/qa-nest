import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { API_PREFIX } from '@/shared/constants/api'

import { cleanupE2eData } from './e2e-data.helper'

type SetupE2eOptions = {
  useApiPrefix?: boolean
}

export function setupE2e(options: SetupE2eOptions = {}) {
  const { useApiPrefix = true } = options

  let app: INestApplication
  let testingModule: TestingModule
  let prismaService: PrismaService

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    prismaService = testingModule.get(PrismaService)

    await prismaService.$connect()
    await cleanupE2eData(prismaService)

    app = testingModule.createNestApplication()

    if (useApiPrefix) {
      app.setGlobalPrefix(API_PREFIX)
    }

    await app.init()
  })

  afterAll(async () => {
    if (prismaService) {
      await cleanupE2eData(prismaService)
    }

    if (app) {
      await app.close()
    }
  })

  return {
    getApp: () => app,
    request: () => request(app.getHttpServer()),
  }
}
