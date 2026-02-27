import { fakerRU as faker } from '@faker-js/faker'

import { appDataSource } from '@/database/data-source'
import { AnswerEntity } from '@/answers/answer.entity'
import { QuestionEntity } from '@/questions/question.entity'
import { UserEntity } from '@/users/user.entity'

type SeedAnswer = Pick<AnswerEntity, 'questionId' | 'authorId' | 'answerText' | 'isBest'>

function buildAnswer(questionId: string, authorId: string, isBest: boolean): SeedAnswer {
  const answerText = faker.helpers
    .multiple(() => faker.lorem.sentence({ min: 8, max: 18 }), {
      count: faker.number.int({ min: 1, max: 4 }),
    })
    .join(' ')

  return {
    questionId,
    authorId,
    answerText,
    isBest,
  }
}

function buildAnswersForQuestion(questionId: string, userIds: string[]): SeedAnswer[] {
  const answersCount = faker.number.int({ min: 0, max: 10 })

  if (answersCount === 0) {
    return []
  }

  const shouldHaveBestAnswer = faker.datatype.boolean()
  const bestAnswerIndex = shouldHaveBestAnswer
    ? faker.number.int({ min: 0, max: answersCount - 1 })
    : -1

  const answers: SeedAnswer[] = []

  for (let answerIndex = 0; answerIndex < answersCount; answerIndex += 1) {
    const authorId = faker.helpers.arrayElement(userIds)
    answers.push(buildAnswer(questionId, authorId, answerIndex === bestAnswerIndex))
  }

  return answers
}

async function seedAnswersReset(): Promise<void> {
  await appDataSource.initialize()

  try {
    const usersRepository = appDataSource.getRepository(UserEntity)
    const questionsRepository = appDataSource.getRepository(QuestionEntity)
    const answersRepository = appDataSource.getRepository(AnswerEntity)

    faker.seed(2027)

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

    const questions = await questionsRepository.find({
      select: {
        id: true,
      },
      order: {
        createdAt: 'ASC',
      },
    })

    if (questions.length === 0) {
      console.log('Seed skipped: no questions found. Run seed:questions first.')
      return
    }

    await answersRepository.createQueryBuilder().delete().execute()

    const seedAnswers = questions.flatMap((question) =>
      buildAnswersForQuestion(question.id, userIds),
    )

    if (seedAnswers.length === 0) {
      console.log(
        `Seed completed: reset answers table, but generated 0 answers for ${questions.length} questions`,
      )
      return
    }

    const answerEntities = answersRepository.create(seedAnswers)

    await answersRepository.save(answerEntities)

    const bestAnswersCount = seedAnswers.filter((answer) => answer.isBest).length

    console.log(
      `Seed completed: reset answers and inserted ${answerEntities.length} answers for ${questions.length} questions (${bestAnswersCount} best answers)`,
    )
  } finally {
    await appDataSource.destroy()
  }
}

seedAnswersReset().catch((error: unknown) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
