import 'dotenv/config'

import * as bcrypt from 'bcrypt'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { seedUsersList } from '@/shared/seed-data/users'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedUsersReset(): Promise<void> {
  try {
    await prisma.answer.deleteMany()
    await prisma.question.deleteMany()
    await prisma.user.deleteMany()

    const usersData = await Promise.all(
      seedUsersList.map(async (user) => ({
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
      })),
    )

    await prisma.user.createMany({ data: usersData })

    console.log(`Seed completed: inserted ${usersData.length} users`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

seedUsersReset().catch((error: unknown) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
