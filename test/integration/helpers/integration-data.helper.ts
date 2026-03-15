import { UserRole } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

export const INTEGRATION_NAMESPACE = 'int'
export const INTEGRATION_TITLE_PREFIX = `[${INTEGRATION_NAMESPACE}]`
export const INTEGRATION_EMAIL_PREFIX = `${INTEGRATION_NAMESPACE}-`

export async function cleanupIntegrationData(prismaService: PrismaService): Promise<void> {
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

export async function createIntegrationUser(
  prismaService: PrismaService,
  suffix: string,
  name = 'Integration User',
) {
  return prismaService.user.create({
    data: {
      name,
      email: `${INTEGRATION_EMAIL_PREFIX}${suffix}@example.com`,
      passwordHash: 'integration-test-password-hash',
      role: UserRole.USER,
    },
  })
}

export async function createIntegrationQuestion(
  prismaService: PrismaService,
  authorId: string,
  suffix: string,
) {
  return prismaService.question.create({
    data: {
      authorId,
      title: `${INTEGRATION_TITLE_PREFIX} question ${suffix}`,
      questionText: `${INTEGRATION_TITLE_PREFIX} question text ${suffix}`,
    },
  })
}

export async function createIntegrationAnswer(
  prismaService: PrismaService,
  questionId: string,
  authorId: string,
  answerText: string,
  isBest = false,
) {
  return prismaService.answer.create({
    data: {
      questionId,
      authorId,
      answerText,
      isBest,
    },
  })
}
