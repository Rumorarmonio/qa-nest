import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import { AnswersService } from '@/answers/answers.service'
import type { PrismaService } from '@/prisma/prisma.service'

import {
  NON_EXISTING_UUID,
} from './helpers/integration-data.helper'
import type { IntegrationHelpers } from './helpers/integration-data.types'
import { setupIntegration } from './helpers/setup-integration'

describe('AnswersService (integration)', () => {
  let answersService: AnswersService
  const ctx = setupIntegration({ providers: [AnswersService] })
  let prismaService: PrismaService
  let helpers: IntegrationHelpers

  beforeAll(async () => {
    answersService = ctx.testingModule.get(AnswersService)
    prismaService = ctx.prismaService
    helpers = ctx.helpers
  })

  it('markBest should mark selected answer as best', async () => {
    const user = await helpers.createUser('user-1')
    const question = await helpers.createQuestion(user.id, '1')

    const firstAnswer = await helpers.createAnswer(question.id, user.id, 'First answer')

    const secondAnswer = await helpers.createAnswer(question.id, user.id, 'Second answer')

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
    const user = await helpers.createUser('user-2')
    const question = await helpers.createQuestion(user.id, '2')

    const firstAnswer = await helpers.createAnswer(question.id, user.id, 'First answer', {
      isBest: true,
    })

    const secondAnswer = await helpers.createAnswer(question.id, user.id, 'Second answer')

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
    const user = await helpers.createUser('user-3')

    const firstQuestion = await helpers.createQuestion(user.id, '3')
    const secondQuestion = await helpers.createQuestion(user.id, '4')

    const firstQuestionAnswer = await helpers.createAnswer(
      firstQuestion.id,
      user.id,
      'First question answer',
      { isBest: true },
    )

    const secondQuestionAnswer = await helpers.createAnswer(
      secondQuestion.id,
      user.id,
      'Second question answer',
      { isBest: true },
    )

    const secondQuestionNewBest = await helpers.createAnswer(
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
    await expect(answersService.markBest(NON_EXISTING_UUID)).rejects.toThrow(NotFoundException)
  })

  it('create should replace previous best answer when creating a new best answer', async () => {
    const user = await helpers.createUser('answers-create-best')
    const question = await helpers.createQuestion(user.id, 'create-best')

    const firstAnswer = await helpers.createAnswer(question.id, user.id, 'First best answer', {
      isBest: true,
    })

    const createdAnswer = await answersService.create(
      question.id,
      {
        answerText: 'Second best answer',
        isBest: true,
      },
      user.id,
    )

    expect(createdAnswer.id).not.toBe(firstAnswer.id)
    expect(createdAnswer.isBest).toBe(true)

    const answers = await prismaService.answer.findMany({
      where: { questionId: question.id },
      orderBy: { createdAt: 'asc' },
    })

    expect(answers).toHaveLength(2)
    expect(answers.find((answer) => answer.id === firstAnswer.id)?.isBest).toBe(false)
    expect(answers.find((answer) => answer.id === createdAnswer.id)?.isBest).toBe(true)
  })

  it('create should respect the DB constraint for one best answer per question', async () => {
    const user = await helpers.createUser('answers-db-constraint')
    const question = await helpers.createQuestion(user.id, 'db-constraint')

    await helpers.createAnswer(question.id, user.id, 'Existing best answer', {
      isBest: true,
    })

    await expect(
      prismaService.answer.create({
        data: {
          questionId: question.id,
          authorId: user.id,
          answerText: 'Conflicting best answer',
          isBest: true,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' })
  })

  it('update should update answer text for the owner', async () => {
    const user = await helpers.createUser('answers-update')
    const question = await helpers.createQuestion(user.id, 'answers-update')
    const answer = await helpers.createAnswer(question.id, user.id, 'Answer before update')
    const currentUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const updatedAnswer = await answersService.update(
      answer.id,
      {
        answerText: 'Answer after update',
      },
      currentUser,
    )

    expect(updatedAnswer).toEqual(
      expect.objectContaining({
        id: answer.id,
        answerText: 'Answer after update',
      }),
    )
  })

  it('update should throw ForbiddenException for another user', async () => {
    const owner = await helpers.createUser('answers-owner')
    const otherUser = await helpers.createUser('answers-other')
    const question = await helpers.createQuestion(owner.id, 'answers-forbidden')
    const answer = await helpers.createAnswer(
      question.id,
      owner.id,
      'Answer before forbidden update',
    )

    await expect(
      answersService.update(
        answer.id,
        {
          answerText: 'Forbidden answer update',
        },
        {
          sub: otherUser.id,
          email: otherUser.email,
          role: otherUser.role,
        },
      ),
    ).rejects.toThrow(ForbiddenException)
  })

  it('update should throw NotFoundException for missing answer', async () => {
    await expect(
      answersService.update(
        NON_EXISTING_UUID,
        {
          answerText: 'Missing answer update',
        },
        {
          sub: '00000000-0000-4000-8000-000000000000',
          email: 'missing@example.com',
          role: UserRole.USER,
        },
      ),
    ).rejects.toThrow(NotFoundException)
  })
})
