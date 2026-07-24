import { BadGatewayException } from '@nestjs/common'

export function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback
  }

  return value === 'true'
}

export function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new BadGatewayException(`${name} is not set`)
  }

  return value
}
