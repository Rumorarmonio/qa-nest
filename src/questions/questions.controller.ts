import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

import {
  CreateQuestionDto,
  DeleteQuestionResultDto,
  ListQuestionsQueryDto,
  QuestionDto,
  QuestionIdParamDto,
  QuestionsListResponseDto,
  UpdateQuestionDto,
} from '@/questions/questions.dto'
import { QuestionsService } from '@/questions/questions.service'

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ZodResponse({ type: QuestionsListResponseDto })
  findAll(@Query() query: ListQuestionsQueryDto) {
    return this.questionsService.findAll(query)
  }

  @Get(':id')
  @ZodResponse({ type: QuestionDto })
  findOne(@Param() params: QuestionIdParamDto) {
    return this.questionsService.findOneOrThrow(params.id)
  }

  @Post()
  @ZodResponse({ type: QuestionDto, status: 201 })
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto)
  }

  @Patch(':id')
  @ZodResponse({ type: QuestionDto })
  update(@Param() params: QuestionIdParamDto, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(params.id, dto)
  }

  @Delete(':id')
  @ZodResponse({ type: DeleteQuestionResultDto })
  remove(@Param() params: QuestionIdParamDto) {
    return this.questionsService.remove(params.id)
  }
}
