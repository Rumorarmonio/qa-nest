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

type QuestionSeedData = {
  authorId: string
  title: string
  questionText: string
}

function buildQuestion(authorId: string): QuestionSeedData {
  const rawTitle = faker.hacker.phrase().replace(/\.$/, '')
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)

  const questionText = faker.helpers
    .multiple(() => faker.lorem.sentence({ min: 8, max: 16 }), {
      count: faker.number.int({ min: 2, max: 4 }),
    })
    .join(' ')

  return {
    authorId,
    title,
    questionText,
  }
}

async function seedQuestionsReset(): Promise<void> {
  try {
    faker.seed(2026)

    const users = await prisma.user.findMany({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })

    if (users.length === 0) {
      console.log('Seed skipped: no users found. Run seed:users first.')
      return
    }

    const userIds = users.map((user) => user.id)

    // Вопросы зависят от ответов через FK, поэтому чистим ответы перед вопросами
    await prisma.answer.deleteMany()
    await prisma.question.deleteMany()

    const questionsData: QuestionSeedData[] = Array.from({ length: 20 }, () => {
      const authorId = faker.helpers.arrayElement(userIds)
      return buildQuestion(authorId as string)
    })

    await prisma.question.createMany({ data: questionsData })

    console.log(`Seed completed: reset questions and inserted ${questionsData.length} questions`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

seedQuestionsReset().catch((error: unknown) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
