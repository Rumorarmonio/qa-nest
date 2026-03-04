import { Module } from '@nestjs/common'
import { QuestionsController } from '@/questions/questions.controller'
import { QuestionsService } from '@/questions/questions.service'

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
