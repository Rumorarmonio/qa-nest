import { UserRole } from '@prisma/client'

export type CreateIntegrationQuestionOverrides = Partial<{
  title: string
  questionText: string
  createdAt: Date
}>

export type CreateIntegrationAnswerOptions = {
  isBest?: boolean
  createdAt?: Date
}

export type IntegrationUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type IntegrationQuestion = {
  id: string
  title: string
  questionText: string
}

export type IntegrationAnswer = {
  id: string
  questionId: string
  authorId: string
  answerText: string
  isBest: boolean
}

export type CleanupIntegrationData = () => Promise<void>

export type CreateIntegrationUser = (suffix: string, name?: string) => Promise<IntegrationUser>

export type CreateIntegrationQuestion = (
  authorId: string,
  suffix: string,
  overrides?: CreateIntegrationQuestionOverrides,
) => Promise<IntegrationQuestion>

export type CreateIntegrationAnswer = (
  questionId: string,
  authorId: string,
  answerText: string,
  options?: CreateIntegrationAnswerOptions,
) => Promise<IntegrationAnswer>

export type IntegrationHelpers = {
  cleanup: CleanupIntegrationData
  createUser: CreateIntegrationUser
  createQuestion: CreateIntegrationQuestion
  createAnswer: CreateIntegrationAnswer
}
