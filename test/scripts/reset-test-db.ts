import { execFileSync } from 'node:child_process'

import { loadTestEnv } from '@test/helpers/load-test-env'

loadTestEnv()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'migrate', 'reset', '--force'],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  },
)

execFileSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'seed:users'],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  },
)
