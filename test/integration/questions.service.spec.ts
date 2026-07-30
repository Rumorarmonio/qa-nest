import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import { QuestionsService } from '@/questions/questions.service'
import type { PrismaService } from '@/prisma/prisma.service'

import {
  INTEGRATION_TITLE_PREFIX,
  NON_EXISTING_UUID,
} from './helpers/integration-data.helper'
import type { IntegrationHelpers } from './helpers/integration-data.types'
import { setupIntegration } from './helpers/setup-integration'

describe('QuestionsService (integration)', () => {
  let questionsService: QuestionsService
  const ctx = setupIntegration({ providers: [QuestionsService] })
  let prismaService: PrismaService
  let helpers: IntegrationHelpers

  beforeAll(async () => {
    questionsService = ctx.testingModule.get(QuestionsService)
    prismaService = ctx.prismaService
    helpers = ctx.helpers
  })

  it('findAll should return paginated questions list without answers by default', async () => {
    const user = await helpers.createUser('questions-find-all-1')

    const firstQuestion = await helpers.createQuestion(user.id, '1')
    const secondQuestion = await helpers.createQuestion(user.id, '2')
    const thirdQuestion = await helpers.createQuestion(user.id, '3')

    const result = await questionsService.findAll({
      page: 1,
      limit: 500,
      includeAnswers: false,
      answersLimit: 1,
    })

    expect(result.pagination.page).toBe(1)
    expect(result.pagination.limit).toBe(500)
    expect(result.pagination.total).toBeGreaterThanOrEqual(3)
    expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1)

    const integrationQuestions = result.items.filter((item) =>
      [firstQuestion.id, secondQuestion.id, thirdQuestion.id].includes(item.id),
    )

    expect(integrationQuestions).toHaveLength(3)

    for (const item of integrationQuestions) {
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          questionText: expect.any(String),
          author: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
          answersCount: expect.any(Number),
        }),
      )

      expect(item.answers).toBeUndefined()
    }
  })

  it('findAll should include answers and respect answersLimit', async () => {
    const user = await helpers.createUser('questions-find-all-2')
    const question = await helpers.createQuestion(user.id, 'with-answers')

    await helpers.createAnswer(question.id, user.id, 'Answer 1')
    await helpers.createAnswer(question.id, user.id, 'Answer 2')
    await helpers.createAnswer(question.id, user.id, 'Answer 3')

    const result = await questionsService.findAll({
      page: 1,
      limit: 500,
      includeAnswers: true,
      answersLimit: 2,
    })

    const targetQuestion = result.items.find((item) => item.id === question.id)

    expect(targetQuestion).toBeDefined()
    expect(targetQuestion?.answersCount).toBe(3)
    expect(Array.isArray(targetQuestion?.answers)).toBe(true)
    expect(targetQuestion?.answers).toHaveLength(2)
    expect(targetQuestion?.answersComplete).toBe(false)
    expect(targetQuestion?.answers?.[0].author.role).toBe(user.role)
  })

  it('findAll should order included answers with best answer first, then by createdAt asc', async () => {
    const user = await helpers.createUser('questions-find-all-3')
    const question = await helpers.createQuestion(user.id, 'answers-order')

    const earlierDate = new Date('2026-01-01T10:00:00.000Z')
    const laterDate = new Date('2026-01-01T11:00:00.000Z')
    const bestDate = new Date('2026-01-01T12:00:00.000Z')

    const regularEarlier = await helpers.createAnswer(
      question.id,
      user.id,
      'Regular earlier',
      { createdAt: earlierDate },
    )

    const regularLater = await helpers.createAnswer(
      question.id,
      user.id,
      'Regular later',
      { createdAt: laterDate },
    )

    const bestAnswer = await helpers.createAnswer(
      question.id,
      user.id,
      'Best answer',
      { isBest: true, createdAt: bestDate },
    )

    const result = await questionsService.findAll({
      page: 1,
      limit: 500,
      includeAnswers: true,
      answersLimit: 10,
    })

    const targetQuestion = result.items.find((item) => item.id === question.id)

    expect(targetQuestion).toBeDefined()
    expect(targetQuestion?.answers).toHaveLength(3)
    expect(targetQuestion?.answersComplete).toBe(true)
    expect(targetQuestion?.answers?.[0].id).toBe(bestAnswer.id)
    expect(targetQuestion?.answers?.[1].id).toBe(regularEarlier.id)
    expect(targetQuestion?.answers?.[2].id).toBe(regularLater.id)
  })

  it('findAll should include all answers when answersLimit is not provided', async () => {
    const user = await helpers.createUser('questions-find-all-4')
    const question = await helpers.createQuestion(user.id, 'all-answers')

    await helpers.createAnswer(question.id, user.id, 'Answer 1')
    await helpers.createAnswer(question.id, user.id, 'Answer 2')
    await helpers.createAnswer(question.id, user.id, 'Answer 3')

    const result = await questionsService.findAll({
      page: 1,
      limit: 500,
      includeAnswers: true,
    })

    const targetQuestion = result.items.find((item) => item.id === question.id)

    expect(targetQuestion?.answersCount).toBe(3)
    expect(targetQuestion?.answers).toHaveLength(3)
    expect(targetQuestion?.answersComplete).toBe(true)
  })

  it('findOneOrThrow should return question with author', async () => {
    const user = await helpers.createUser('questions-find-one')
    const question = await helpers.createQuestion(user.id, 'find-one')

    const result = await questionsService.findOneOrThrow(question.id)

    expect(result).toEqual(
      expect.objectContaining({
        id: question.id,
        title: question.title,
        questionText: question.questionText,
        author: expect.objectContaining({
          id: user.id,
          name: user.name,
        }),
      }),
    )
  })

  it('findOneOrThrow should throw NotFoundException for missing question', async () => {
    await expect(questionsService.findOneOrThrow(NON_EXISTING_UUID)).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update should update question fields', async () => {
    const user = await helpers.createUser('questions-update')
    const question = await helpers.createQuestion(user.id, 'before-update')
    const currentUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const updatedQuestion = await questionsService.update(
      question.id,
      {
        title: `${INTEGRATION_TITLE_PREFIX} updated title`,
        questionText: `${INTEGRATION_TITLE_PREFIX} updated text`,
      },
      currentUser,
    )

    expect(updatedQuestion).toEqual(
      expect.objectContaining({
        id: question.id,
        title: `${INTEGRATION_TITLE_PREFIX} updated title`,
        questionText: `${INTEGRATION_TITLE_PREFIX} updated text`,
      }),
    )
  })

  it('update should throw ForbiddenException for another user', async () => {
    const owner = await helpers.createUser('questions-owner')
    const otherUser = await helpers.createUser('questions-other')
    const question = await helpers.createQuestion(owner.id, 'forbidden-update')

    await expect(
      questionsService.update(
        question.id,
        {
          title: `${INTEGRATION_TITLE_PREFIX} forbidden title`,
        },
        {
          sub: otherUser.id,
          email: otherUser.email,
          role: otherUser.role,
        },
      ),
    ).rejects.toThrow(ForbiddenException)
  })

  it('update should throw NotFoundException for missing question', async () => {
    await expect(
      questionsService.update(
        NON_EXISTING_UUID,
        {
          title: `${INTEGRATION_TITLE_PREFIX} updated title`,
        },
        {
          sub: '00000000-0000-4000-8000-000000000000',
          email: 'missing@example.com',
          role: UserRole.USER,
        },
      ),
    ).rejects.toThrow(NotFoundException)
  })

  it('remove should return deleted: true for existing question', async () => {
    const user = await helpers.createUser('questions-remove-existing')
    const question = await helpers.createQuestion(user.id, 'remove-existing')

    const result = await questionsService.remove(question.id)

    expect(result).toEqual({
      deleted: true,
    })
  })

  it('remove should return deleted: false for missing question', async () => {
    const result = await questionsService.remove(NON_EXISTING_UUID)

    expect(result).toEqual({
      deleted: false,
    })
  })
})
