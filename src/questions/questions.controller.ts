import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { Roles } from '@/auth/roles.decorator'
import { RolesGuard } from '@/auth/roles.guard'
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
import { UserRole } from '@/users/user-role.enum'

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: QuestionDto, status: 201 })
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: QuestionDto })
  update(@Param() params: QuestionIdParamDto, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(params.id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: DeleteQuestionResultDto })
  remove(@Param() params: QuestionIdParamDto) {
    return this.questionsService.remove(params.id)
  }
}
