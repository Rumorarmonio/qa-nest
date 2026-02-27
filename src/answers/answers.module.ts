import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AnswerEntity } from '@/answers/answer.entity'
import { AnswersController } from '@/answers/answers.controller'
import { AnswersService } from '@/answers/answers.service'
import { QuestionEntity } from '@/questions/question.entity'

@Module({
  imports: [TypeOrmModule.forFeature([AnswerEntity, QuestionEntity])],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}
