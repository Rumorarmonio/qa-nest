import { execFileSync } from 'node:child_process'
import path from 'node:path'

import * as dotenv from 'dotenv'

dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
})

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
