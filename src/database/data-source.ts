import 'reflect-metadata'

import { config as loadEnv } from 'dotenv'
import { DataSource } from 'typeorm'

import { QuestionEntity } from '@/questions/question.entity'
import { AnswerEntity } from '@/answers/answer.entity'

loadEnv()

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'app',
  password: process.env.DATABASE_PASSWORD ?? 'app',
  database: process.env.DATABASE_NAME ?? 'app',
  entities: [QuestionEntity, AnswerEntity],
  synchronize: false,
  logging: false,
})
