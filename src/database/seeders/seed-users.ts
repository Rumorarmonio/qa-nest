import 'dotenv/config'

import * as bcrypt from 'bcrypt'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

type SeedUser = {
  name: string
  email: string
  password: string
  role: UserRole
}

const seedUsers: SeedUser[] = [
  { name: 'User One', email: 'user1@example.com', password: 'Password123!', role: UserRole.USER },
  { name: 'User Two', email: 'user2@example.com', password: 'Password123!', role: UserRole.USER },
  { name: 'User Three', email: 'user3@example.com', password: 'Password123!', role: UserRole.USER },
  { name: 'Admin', email: 'admin@example.com', password: 'Password123!', role: UserRole.ADMIN },
]

async function seedUsersReset(): Promise<void> {
  try {
    await prisma.answer.deleteMany()
    await prisma.question.deleteMany()
    await prisma.user.deleteMany()

    const usersData = await Promise.all(
      seedUsers.map(async (user) => ({
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
