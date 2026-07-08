import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

import { CurrentUser } from '@/auth/current-user.decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import type { JwtPayload } from '@/auth/jwt-payload.type'
import { Roles } from '@/auth/roles.decorator'
import { RolesGuard } from '@/auth/roles.guard'
import {
  AnswerDto,
  AnswerIdParamDto,
  CreateAnswerDto,
  DeleteAnswerResultDto,
  QuestionIdParamDto,
  UpdateAnswerDto,
} from '@/answers/answers.dto'
import { AnswersService } from '@/answers/answers.service'
import { UserRole } from '@prisma/client'

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: AnswerDto, status: 201 })
  create(
    @Param() params: QuestionIdParamDto,
    @Body() dto: CreateAnswerDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.answersService.create(params.questionId, dto, currentUser.sub)
  }

  @Patch('answers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: AnswerDto })
  update(
    @Param() params: AnswerIdParamDto,
    @Body() dto: UpdateAnswerDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.answersService.update(params.id, dto, currentUser)
  }

  @Patch('answers/:id/mark-best')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: AnswerDto })
  markBest(@Param() params: AnswerIdParamDto) {
    return this.answersService.markBest(params.id)
  }

  @Delete('answers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ZodResponse({ type: DeleteAnswerResultDto })
  remove(@Param() params: AnswerIdParamDto) {
    return this.answersService.remove(params.id)
  }
}
