import { Module } from '@nestjs/common'
import { AnswersController } from '@/answers/answers.controller'
import { AnswersService } from '@/answers/answers.service'

@Module({
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}
