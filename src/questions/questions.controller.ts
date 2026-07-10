import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

import { CurrentUser } from '@/auth/current-user.decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import type { JwtPayload } from '@/auth/jwt-payload.type'
import { Roles } from '@/auth/roles.decorator'
import { RolesGuard } from '@/auth/roles.guard'
import {
  CreateQuestionDto,
  ListQuestionsQueryDto,
  QuestionDto,
  QuestionsListResponseDto,
  UpdateQuestionDto,
} from '@/questions/questions.dto'
import { IdParamDto } from '@/common/schemas/param.schema'
import { QuestionsService } from '@/questions/questions.service'
import { DeleteResultDto } from '@/common/schemas/common.schema'
import { UserRole } from '@prisma/client'

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
  findOne(@Param() params: IdParamDto) {
    return this.questionsService.findOneOrThrow(params.id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: QuestionDto, status: 201 })
  create(@Body() dto: CreateQuestionDto, @CurrentUser() currentUser: JwtPayload) {
    return this.questionsService.create(dto, currentUser.sub)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: QuestionDto })
  update(
    @Param() params: IdParamDto,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.questionsService.update(params.id, dto, currentUser)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: DeleteResultDto })
  remove(@Param() params: IdParamDto) {
    return this.questionsService.remove(params.id)
  }
}
