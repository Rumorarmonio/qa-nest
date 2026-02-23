import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AnswerEntity } from '@/answers/answer.entity'

@Entity({ name: 'questions' })
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  userName!: string

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
