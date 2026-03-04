import 'dotenv/config'

import { fakerRU as faker } from '@faker-js/faker'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

function buildAnswersForQuestion(questionId: string, userIds: string[]) {
  const answersCount = faker.number.int({ min: 0, max: 10 })

  if (answersCount === 0) {
    return []
  }

  const shouldHaveBestAnswer = faker.datatype.boolean()
  const bestAnswerIndex = shouldHaveBestAnswer
    ? faker.number.int({ min: 0, max: answersCount - 1 })
    : -1

  return Array.from({ length: answersCount }, (_, index) => {
    const answerText = faker.helpers
      .multiple(() => faker.lorem.sentence({ min: 8, max: 18 }), {
        count: faker.number.int({ min: 1, max: 4 }),
      })
      .join(' ')

    return {
      questionId,
      authorId: faker.helpers.arrayElement(userIds),
      answerText,
      isBest: index === bestAnswerIndex,
    }
  })
}

async function seedAnswersReset(): Promise<void> {
  try {
    faker.seed(2027)

    const users = await prisma.user.findMany({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })

    if (users.length === 0) {
      console.log('Seed skipped: no users found. Run seed:users first.')
      return
    }

    const userIds = users.map((user) => user.id)

    const questions = await prisma.question.findMany({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })

    if (questions.length === 0) {
      console.log('Seed skipped: no questions found. Run seed:questions first.')
      return
    }

    await prisma.answer.deleteMany()

    const answersData = questions.flatMap((question) =>
      buildAnswersForQuestion(question.id, userIds),
    )

    if (answersData.length === 0) {
      console.log(
        `Seed completed: reset answers, but generated 0 answers for ${questions.length} questions`,
      )
      return
    }

    await prisma.answer.createMany({ data: answersData })

    const bestCount = answersData.filter((answer) => answer.isBest).length

    console.log(
      `Seed completed: reset answers and inserted ${answersData.length} answers for ${questions.length} questions (${bestCount} best answers)`,
    )
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

seedAnswersReset().catch((error: unknown) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
