import { PrismaService } from '@/prisma/prisma.service'

export type TestDataCleanupOptions = {
  titlePrefix: string
  emailPrefix: string
}

export async function cleanupTestData(
  prismaService: PrismaService,
  options: TestDataCleanupOptions,
): Promise<void> {
  const { titlePrefix, emailPrefix } = options

  await prismaService.answer.deleteMany({
    where: {
      question: {
        title: {
          startsWith: titlePrefix,
        },
      },
    },
  })

  await prismaService.question.deleteMany({
    where: {
      title: {
        startsWith: titlePrefix,
      },
    },
  })

  await prismaService.user.deleteMany({
    where: {
      email: {
        startsWith: emailPrefix,
      },
    },
  })
}
