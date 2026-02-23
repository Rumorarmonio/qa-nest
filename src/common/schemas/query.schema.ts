import { z } from 'zod'

// TODO: использовать эти переиспользуемые функции
// Универсальный трансформер для boolean из query-параметров
export const booleanQuerySchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === 'true' || v === true)

// Базовая схема пагинации, которую можно расширять через .extend()
export const basePaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

// Схема мета-данных ответа (то, что в поле pagination)
export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
})
