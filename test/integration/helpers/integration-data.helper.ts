import { PrismaService } from '@/prisma/prisma.service'
import { UserRole } from '@prisma/client'

import {
  type CreateIntegrationAnswerOptions,
  type CreateIntegrationQuestionOverrides,
  type IntegrationHelpers,
} from './integration-data.types'

export const INTEGRATION_NAMESPACE = 'int'
export const INTEGRATION_TITLE_PREFIX = `[${INTEGRATION_NAMESPACE}]`
export const INTEGRATION_EMAIL_PREFIX = `${INTEGRATION_NAMESPACE}-`
export const INTEGRATION_PASSWORD_HASH = 'integration-test-password-hash'
export const NON_EXISTING_UUID = '00000000-0000-4000-8000-000000000000'

async function cleanupIntegrationData(prismaService: PrismaService): Promise<void> {
  await prismaService.answer.deleteMany({
    where: {
      question: {
        title: {
          startsWith: INTEGRATION_TITLE_PREFIX,
        },
      },
    },
  })

  await prismaService.question.deleteMany({
    where: {
      title: {
        startsWith: INTEGRATION_TITLE_PREFIX,
      },
    },
  })

  await prismaService.user.deleteMany({
    where: {
      email: {
        startsWith: INTEGRATION_EMAIL_PREFIX,
      },
    },
  })
}

async function createIntegrationUser(
  prismaService: PrismaService,
  suffix: string,
  name = 'Integration User',
) {
  return prismaService.user.create({
    data: {
      name,
      email: `${INTEGRATION_EMAIL_PREFIX}${suffix}@example.com`,
      passwordHash: INTEGRATION_PASSWORD_HASH,
      role: UserRole.USER,
    },
  })
}

async function createIntegrationQuestion(
  prismaService: PrismaService,
  authorId: string,
  suffix: string,
  overrides: CreateIntegrationQuestionOverrides = {},
) {
  return prismaService.question.create({
    data: {
      authorId,
      title: overrides.title ?? `${INTEGRATION_TITLE_PREFIX} question ${suffix}`,
      questionText: overrides.questionText ?? `${INTEGRATION_TITLE_PREFIX} question text ${suffix}`,
      createdAt: overrides.createdAt,
    },
  })
}

async function createIntegrationAnswer(
  prismaService: PrismaService,
  questionId: string,
  authorId: string,
  answerText: string,
  options: CreateIntegrationAnswerOptions = {},
) {
  const { isBest = false, createdAt } = options

  return prismaService.answer.create({
    data: {
      questionId,
      authorId,
      answerText,
      isBest,
      createdAt,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export function createIntegrationHelpers(prismaService: PrismaService): IntegrationHelpers {
  return {
    cleanup: () => cleanupIntegrationData(prismaService),
    createUser: (suffix: string, name = 'Integration User') =>
      createIntegrationUser(prismaService, suffix, name),
    createQuestion: (authorId: string, suffix: string, overrides = {}) =>
      createIntegrationQuestion(prismaService, authorId, suffix, overrides),
    createAnswer: (questionId: string, authorId: string, answerText: string, options = {}) =>
      createIntegrationAnswer(prismaService, questionId, authorId, answerText, options),
  }
}
