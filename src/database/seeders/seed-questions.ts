import { fakerRU as faker } from '@faker-js/faker'

import { appDataSource } from '@/database/data-source'

import { AnswerEntity } from '@/answers/answer.entity'
import { QuestionEntity } from '@/questions/question.entity'
import { UserEntity } from '@/users/user.entity'

type SeedQuestion = Pick<QuestionEntity, 'authorId' | 'title' | 'questionText'>

function buildQuestion(authorId: string): SeedQuestion {
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
  await appDataSource.initialize()

  try {
    const usersRepository = appDataSource.getRepository(UserEntity)
    const answersRepository = appDataSource.getRepository(AnswerEntity)
    const questionsRepository = appDataSource.getRepository(QuestionEntity)

    faker.seed(2026)

    const users = await usersRepository.find({
      select: {
        id: true,
      },
      order: {
        createdAt: 'ASC',
      },
    })

    if (users.length === 0) {
      console.log('Seed skipped: no users found. Run seed:users first.')
      return
    }

    const userIds = users.map((user) => user.id)

    await answersRepository.createQueryBuilder().delete().execute()
    await questionsRepository.createQueryBuilder().delete().execute()

    const seedQuestions = Array.from({ length: 20 }, () => {
      const authorId = faker.helpers.arrayElement(userIds)
      return buildQuestion(authorId)
    })

    const questionEntities = questionsRepository.create(seedQuestions)

    await questionsRepository.save(questionEntities)

    console.log(`Seed completed: reset table and inserted ${questionEntities.length} questions`)
  } finally {
    await appDataSource.destroy()
  }
}

seedQuestionsReset().catch((error: unknown) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
