import path from 'node:path'

import * as dotenv from 'dotenv'

export function loadTestEnv(): void {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env.test'),
  })
}
