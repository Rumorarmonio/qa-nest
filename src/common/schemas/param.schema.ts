import { z } from 'zod'

export function createUuidParamSchema(fieldName = 'id') {
  return z.object({ [fieldName]: z.uuid() }).strict()
}
