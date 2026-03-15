import { healthRoutes } from '@test/e2e/api/api-routes.health'
import { authRoutes } from '@test/e2e/api/api-routes.auth'
import { questionsRoutes } from '@test/e2e/api/api-routes.questions'
import { answersRoutes } from '@test/e2e/api/api-routes.answers'

export const apiRoutes = {
  health: healthRoutes,
  auth: authRoutes,
  questions: questionsRoutes,
  answers: answersRoutes,
}
