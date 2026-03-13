type PrimitiveQueryValue = string | number | boolean | null | undefined

type QueryParams = Record<string, PrimitiveQueryValue>

type QuestionsListQuery = {
  page?: number
  limit?: number
  includeAnswers?: boolean
  answersLimit?: number
}

export const API_PREFIX = 'api'
export const API_PREFIX_PATH = `/${API_PREFIX}`

function buildUrl(path: string, query?: QueryParams): string {
  if (!query) {
    return path
  }

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()

  if (!queryString) {
    return path
  }

  return `${path}?${queryString}`
}

export const apiRoutes = {
  health: `${API_PREFIX_PATH}/health`,

  auth: {
    register: `${API_PREFIX_PATH}/auth/register`,
    login: `${API_PREFIX_PATH}/auth/login`,
    me: `${API_PREFIX_PATH}/auth/me`,
  },

  questions: {
    list(query?: QuestionsListQuery): string {
      return buildUrl(`${API_PREFIX_PATH}/questions`, query)
    },

    byId(id: string): string {
      return `${API_PREFIX_PATH}/questions/${id}`
    },

    create: `${API_PREFIX_PATH}/questions`,

    update(id: string): string {
      return `${API_PREFIX_PATH}/questions/${id}`
    },

    remove(id: string): string {
      return `${API_PREFIX_PATH}/questions/${id}`
    },

    answers(questionId: string): string {
      return `${API_PREFIX_PATH}/questions/${questionId}/answers`
    },

    createAnswer(questionId: string): string {
      return `${API_PREFIX_PATH}/questions/${questionId}/answers`
    },
  },

  answers: {
    byId(id: string): string {
      return `${API_PREFIX_PATH}/answers/${id}`
    },

    update(id: string): string {
      return `${API_PREFIX_PATH}/answers/${id}`
    },

    remove(id: string): string {
      return `${API_PREFIX_PATH}/answers/${id}`
    },

    markBest(id: string): string {
      return `${API_PREFIX_PATH}/answers/${id}/mark-best`
    },
  },
}
