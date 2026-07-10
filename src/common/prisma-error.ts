type PrismaKnownErrorCode =
  | 'P2002' // Unique constraint failed
  | 'P2003' // Foreign key constraint failed
  | 'P2025' // Record not found or required record missing

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type PrismaErrorCode = PrismaKnownErrorCode | string

type PrismaErrorLike = {
  code: PrismaErrorCode
}

export function hasPrismaErrorCode(
  error: unknown,
  code: PrismaErrorCode,
): error is PrismaErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as Record<string, unknown>).code === code
  )
}
