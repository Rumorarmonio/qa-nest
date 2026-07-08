import type { Provider } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'

import { PrismaModule } from '@/prisma/prisma.module'
import { PrismaService } from '@/prisma/prisma.service'

import { createIntegrationHelpers } from './integration-data.helper'
import type { IntegrationHelpers } from './integration-data.types'

type SetupIntegrationOptions = {
  providers?: Provider[]
}

export type IntegrationContext = {
  testingModule: TestingModule
  prismaService: PrismaService
  helpers: IntegrationHelpers
}

export function setupIntegration(options: SetupIntegrationOptions = {}): IntegrationContext {
  const { providers = [] } = options

  let testingModule: TestingModule
  let prismaService: PrismaService
  let helpers: IntegrationHelpers

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers,
    }).compile()

    prismaService = testingModule.get(PrismaService)
    helpers = createIntegrationHelpers(prismaService)

    await prismaService.$connect()
  })

  beforeEach(async () => {
    await helpers.cleanup()
  })

  afterAll(async () => {
    await helpers.cleanup()
    await testingModule.close()
  })

  return {
    get testingModule() {
      return testingModule
    },
    get prismaService() {
      return prismaService
    },
    get helpers() {
      return helpers
    },
  }
}
