import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { UserRole } from '@/users/user-role.enum'

@Entity('users')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({
    type: 'varchar',
    length: 120,
  })
  name!: string

  @Column({
    type: 'varchar',
    length: 255,
  })
  email!: string

  @Column({
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
