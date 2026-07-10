import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export function createUuidParamSchema(fieldName = 'id') {
  return z.object({ [fieldName]: z.uuid() }).strict()
}

export const idParamSchema = createUuidParamSchema('id')
export class IdParamDto extends createZodDto(idParamSchema) {}
