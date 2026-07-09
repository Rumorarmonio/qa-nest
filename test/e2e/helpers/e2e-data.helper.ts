import { PrismaService } from '@/prisma/prisma.service'
import { cleanupTestData } from '@test/helpers/test-data.helper'

export const E2E_TITLE_PREFIX = '[e2e]'
export const E2E_EMAIL_PREFIX = 'e2e-'

export function createE2eLabel(value: string): string {
  return `${E2E_TITLE_PREFIX} ${value}`
}

export function createE2eEmail(value: string): string {
  return `${E2E_EMAIL_PREFIX}${value}@example.com`
}

export async function cleanupE2eData(prismaService: PrismaService): Promise<void> {
  await cleanupTestData(prismaService, {
    titlePrefix: E2E_TITLE_PREFIX,
    emailPrefix: E2E_EMAIL_PREFIX,
  })
}
