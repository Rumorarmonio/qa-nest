import * as bcrypt from 'bcrypt'

import { appDataSource } from '@/database/data-source'
import { UserEntity } from '@/users/user.entity'
import { UserRole } from '@/users/user-role.enum'

type SeedUser = {
  name: string
  email: string
  password: string
  role: UserRole
}

const seedUsers: SeedUser[] = [
  {
    name: 'User One',
    email: 'user1@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  {
    name: 'User Two',
    email: 'user2@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  {
    name: 'User Three',
    email: 'user3@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  {
    name: 'Admin',
    email: 'admin@example.com',
    password: 'Password123!',
    role: UserRole.ADMIN,
  },
]

async function seedUsersReset(): Promise<void> {
  await appDataSource.initialize()

  try {
    const usersRepository = appDataSource.getRepository(UserEntity)

    await usersRepository.createQueryBuilder().delete().execute()

    const entities: UserEntity[] = []

    for (const seedUser of seedUsers) {
      const passwordHash = await bcrypt.hash(seedUser.password, 10)

      entities.push(
        usersRepository.create({
          name: seedUser.name,
          email: seedUser.email.toLowerCase(),
          passwordHash,
          role: seedUser.role,
        }),
      )
    }

    await usersRepository.save(entities)

    console.log(`Seed completed: inserted ${entities.length} users`)
  } finally {
    await appDataSource.destroy()
  }
}

seedUsersReset().catch((error: unknown) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
