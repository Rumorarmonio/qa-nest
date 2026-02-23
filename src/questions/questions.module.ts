import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AnswerEntity } from '@/answers/answer.entity'
import { QuestionEntity } from '@/questions/question.entity'
import { QuestionsController } from '@/questions/questions.controller'
import { QuestionsService } from '@/questions/questions.service'

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity, AnswerEntity])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
