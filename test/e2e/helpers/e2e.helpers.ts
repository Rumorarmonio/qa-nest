import type { AuthHelpers } from '@test/e2e/helpers/auth.helper'
import { createAuthHelpers, type RequestFactory } from '@test/e2e/helpers/auth.helper'
import type { AnswerHelpers } from '@test/e2e/helpers/answers.helper'
import { createAnswerHelpers } from '@test/e2e/helpers/answers.helper'
import type { QuestionHelpers } from '@test/e2e/helpers/questions.helper'
import { createQuestionHelpers } from '@test/e2e/helpers/questions.helper'

export type E2eHelpers = {
  auth: AuthHelpers
  questions: QuestionHelpers
  answers: AnswerHelpers
}

export function createE2eHelpers(request: RequestFactory): E2eHelpers {
  return {
    auth: createAuthHelpers(request),
    questions: createQuestionHelpers(request),
    answers: createAnswerHelpers(request),
  }
}
