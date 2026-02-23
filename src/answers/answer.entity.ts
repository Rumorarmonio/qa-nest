import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { QuestionEntity } from '@/questions/question.entity'

@Entity({ name: 'answers' })
@Index('IDX_answers_question_id', ['questionId'])
export class AnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  questionId!: string

  @ManyToOne(() => QuestionEntity, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question!: QuestionEntity

  @Column({ type: 'text' })
  userName!: string

  @Column({ type: 'text' })
  answerText!: string

  @Column({ type: 'boolean', default: false })
  isBest!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
