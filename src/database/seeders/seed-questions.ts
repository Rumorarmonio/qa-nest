import { fakerRU as faker } from '@faker-js/faker'

import { appDataSource } from '@/database/data-source'
import { QuestionEntity } from '@/questions/question.entity'

type SeedQuestion = Pick<QuestionEntity, 'userName' | 'title' | 'questionText'>

function buildQuestion(): SeedQuestion {
  const rawTitle = faker.hacker.phrase().replace(/\.$/, '')
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)

  const questionText = faker.helpers
    .multiple(() => faker.lorem.sentence({ min: 8, max: 16 }), {
      count: faker.number.int({ min: 2, max: 4 }),
    })
    .join(' ')

  return {
    userName: faker.person.fullName(),
    title,
    questionText,
  }
}

async function seedQuestionsReset(): Promise<void> {
  await appDataSource.initialize()

  try {
    const questionsRepository = appDataSource.getRepository(QuestionEntity)

    faker.seed(2026)

    await questionsRepository.clear()

    const seedQuestions = Array.from({ length: 20 }, () => buildQuestion())
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
