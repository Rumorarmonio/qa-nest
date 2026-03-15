import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AnswersService } from '@/answers/answers.service'
import { PrismaModule } from '@/prisma/prisma.module'
import { PrismaService } from '@/prisma/prisma.service'

import {
  cleanupIntegrationData,
  createIntegrationAnswer,
  createIntegrationQuestion,
  createIntegrationUser,
} from './helpers/integration-data.helper'

describe('AnswersService (integration)', () => {
  let testingModule: TestingModule
  let answersService: AnswersService
  let prismaService: PrismaService

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [AnswersService],
    }).compile()

    answersService = testingModule.get(AnswersService)
    prismaService = testingModule.get(PrismaService)

    await prismaService.$connect()
  })

  beforeEach(async () => {
    await cleanupIntegrationData(prismaService)
  })

  afterAll(async () => {
    await cleanupIntegrationData(prismaService)
    await testingModule.close()
  })

  it('markBest should mark selected answer as best', async () => {
    const user = await createIntegrationUser(prismaService, 'user-1')
    const question = await createIntegrationQuestion(prismaService, user.id, '1')

    const firstAnswer = await createIntegrationAnswer(
      prismaService,
      question.id,
      user.id,
      'First answer',
    )

    const secondAnswer = await createIntegrationAnswer(
      prismaService,
      question.id,
      user.id,
      'Second answer',
    )

    const updatedAnswer = await answersService.markBest(secondAnswer.id)

    expect(updatedAnswer.id).toBe(secondAnswer.id)
    expect(updatedAnswer.isBest).toBe(true)

    const answers = await prismaService.answer.findMany({
      where: { questionId: question.id },
      orderBy: { createdAt: 'asc' },
    })

    expect(answers).toHaveLength(2)
    expect(answers.find((answer) => answer.id === firstAnswer.id)?.isBest).toBe(false)
    expect(answers.find((answer) => answer.id === secondAnswer.id)?.isBest).toBe(true)
  })

  it('markBest should unset previous best answer in the same question', async () => {
    const user = await createIntegrationUser(prismaService, 'user-2')
    const question = await createIntegrationQuestion(prismaService, user.id, '2')

    const firstAnswer = await createIntegrationAnswer(
      prismaService,
      question.id,
      user.id,
      'First answer',
      true,
    )
    const secondAnswer = await createIntegrationAnswer(
      prismaService,
      question.id,
      user.id,
      'Second answer',
      false,
    )

    await answersService.markBest(secondAnswer.id)

    const answers = await prismaService.answer.findMany({
      where: { questionId: question.id },
    })

    const bestAnswers = answers.filter((answer) => answer.isBest)

    expect(bestAnswers).toHaveLength(1)
    expect(bestAnswers[0]?.id).toBe(secondAnswer.id)
    expect(answers.find((answer) => answer.id === firstAnswer.id)?.isBest).toBe(false)
    expect(answers.find((answer) => answer.id === secondAnswer.id)?.isBest).toBe(true)
  })

  it('markBest should affect only answers of the same question', async () => {
    const user = await createIntegrationUser(prismaService, 'user-3')

    const firstQuestion = await createIntegrationQuestion(prismaService, user.id, '3')
    const secondQuestion = await createIntegrationQuestion(prismaService, user.id, '4')

    const firstQuestionAnswer = await createIntegrationAnswer(
      prismaService,
      firstQuestion.id,
      user.id,
      'First question answer',
      true,
    )

    const secondQuestionAnswer = await createIntegrationAnswer(
      prismaService,
      secondQuestion.id,
      user.id,
      'Second question answer',
      true,
    )

    const secondQuestionNewBest = await createIntegrationAnswer(
      prismaService,
      secondQuestion.id,
      user.id,
      'Second question new best',
    )

    await answersService.markBest(secondQuestionNewBest.id)

    const firstQuestionAnswers = await prismaService.answer.findMany({
      where: { questionId: firstQuestion.id },
    })

    const secondQuestionAnswers = await prismaService.answer.findMany({
      where: { questionId: secondQuestion.id },
    })

    expect(
      firstQuestionAnswers.find((answer) => answer.id === firstQuestionAnswer.id)?.isBest,
    ).toBe(true)

    const secondQuestionBestAnswers = secondQuestionAnswers.filter((answer) => answer.isBest)

    expect(secondQuestionBestAnswers).toHaveLength(1)
    expect(secondQuestionBestAnswers[0]?.id).toBe(secondQuestionNewBest.id)
    expect(
      secondQuestionAnswers.find((answer) => answer.id === secondQuestionAnswer.id)?.isBest,
    ).toBe(false)
  })

  it('markBest should throw NotFoundException for missing answer', async () => {
    await expect(answersService.markBest('00000000-0000-4000-8000-000000000000')).rejects.toThrow(
      NotFoundException,
    )
  })
})
