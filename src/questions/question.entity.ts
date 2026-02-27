import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { AnswerEntity } from '@/answers/answer.entity'
import { UserEntity } from '@/users/user.entity'

@Entity({ name: 'questions' })
@Index('IDX_questions_author_id', ['authorId'])
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  authorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author!: UserEntity

  @Column({ type: 'text' })
  title!: string

  @Column({ type: 'text' })
  questionText!: string

  @OneToMany(() => AnswerEntity, (answer) => answer.question)
  answers!: AnswerEntity[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
