import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import { hasPrismaErrorCode } from '@/common/prisma-error'
import type { DeleteResult } from '@/common/schemas/common.schema'
import { PrismaService } from '@/prisma/prisma.service'
import type { JwtPayload } from '@/auth/jwt-payload.type'
import {
  CreateQuestionInput,
  ListQuestionsQuery,
  Question,
  QuestionListItem,
  QuestionsListResponse,
  UpdateQuestionInput,
} from '@/questions/questions.dto'

@Injectable()
export class QuestionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: ListQuestionsQuery): Promise<QuestionsListResponse> {
    const { page, limit, includeAnswers, answersLimit } = query
    const skip = (page - 1) * limit

    const [total, questions] = await Promise.all([
      this.prismaService.question.count(),
      this.prismaService.question.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { answers: true } },
          answers: includeAnswers
            ? {
                orderBy: [{ isBest: 'desc' }, { createdAt: 'asc' }],
                take: answersLimit,
                include: { author: { select: { id: true, name: true, role: true } } },
              }
            : false,
        },
      }),
    ])

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

    const items = questions.map(({ _count, ...question }) => ({
      ...question,
      answersCount: _count.answers,
      ...(includeAnswers
        ? { answersComplete: question.answers.length >= _count.answers }
        : {}),
    })) as QuestionListItem[]

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  }

  async findOneOrThrow(id: string): Promise<Question> {
    const question = await this.prismaService.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
      },
    })

    if (!question) {
      throw new NotFoundException(`Question ${id} not found`)
    }

    return question
  }

  async create(dto: CreateQuestionInput, authorId: string): Promise<Question> {
    return this.prismaService.question.create({
      data: {
        authorId,
        title: dto.title,
        questionText: dto.questionText,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    })
  }

  async update(id: string, dto: UpdateQuestionInput, currentUser: JwtPayload): Promise<Question> {
    const question = await this.prismaService.question.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!question) {
      throw new NotFoundException(`Question ${id} not found`)
    }

    if (question.authorId !== currentUser.sub && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own question')
    }

    try {
      return await this.prismaService.question.update({
        where: { id },
        data: {
          title: dto.title ?? undefined,
          questionText: dto.questionText ?? undefined,
        },
        include: {
          author: { select: { id: true, name: true } },
        },
      })
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, 'P2025')) {
        throw new NotFoundException(`Question ${id} not found`)
      }

      throw error
    }
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prismaService.question.delete({ where: { id } })
      return { deleted: true }
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, 'P2025')) {
        return { deleted: false }
      }

      throw error
    }
  }
}
