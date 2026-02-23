import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

import { AnswersService } from '@/answers/answers.service'
import {
  AnswerDto,
  AnswerIdParamDto,
  CreateAnswerDto,
  DeleteAnswerResultDto,
  QuestionIdParamDto,
  UpdateAnswerDto,
} from '@/answers/answers.dto'

@ApiTags('answers')
@Controller()
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('questions/:questionId/answers')
  @ZodResponse({ type: [AnswerDto] })
  findAllByQuestion(@Param() params: QuestionIdParamDto) {
    return this.answersService.findAllByQuestion(params.questionId)
  }

  @Get('answers/:id')
  @ZodResponse({ type: AnswerDto })
  findOne(@Param() params: AnswerIdParamDto) {
    return this.answersService.findOneOrThrow(params.id)
  }

  @Post('questions/:questionId/answers')
  @ZodResponse({ type: AnswerDto, status: 201 })
  create(@Param() params: QuestionIdParamDto, @Body() dto: CreateAnswerDto) {
    return this.answersService.create(params.questionId, dto)
  }

  @Patch('answers/:id')
  @ZodResponse({ type: AnswerDto })
  update(@Param() params: AnswerIdParamDto, @Body() dto: UpdateAnswerDto) {
    return this.answersService.update(params.id, dto)
  }

  @Patch('answers/:id/mark-best')
  @ZodResponse({ type: AnswerDto })
  markBest(@Param() params: AnswerIdParamDto) {
    return this.answersService.markBest(params.id)
  }

  @Delete('answers/:id')
  @ZodResponse({ type: DeleteAnswerResultDto })
  remove(@Param() params: AnswerIdParamDto) {
    return this.answersService.remove(params.id)
  }
}
