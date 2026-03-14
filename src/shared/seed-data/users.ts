import { UserRole } from '@prisma/client'

export type SeedUser = {
  name: string
  email: string
  password: string
  role: UserRole
}

export const seedUsers = {
  user1: {
    name: 'User One',
    email: 'user1@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  user2: {
    name: 'User Two',
    email: 'user2@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  user3: {
    name: 'User Three',
    email: 'user3@example.com',
    password: 'Password123!',
    role: UserRole.USER,
  },
  admin: {
    name: 'Admin',
    email: 'admin@example.com',
    password: 'Password123!',
    role: UserRole.ADMIN,
  },
} satisfies Record<string, SeedUser>

export const seedUsersList = Object.values(seedUsers)
