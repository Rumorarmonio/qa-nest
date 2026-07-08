import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'
import type { JwtPayload } from '@/auth/jwt-payload.type'
import {
  CreateQuestionDto,
  ListQuestionsQueryDto,
  UpdateQuestionDto,
} from '@/questions/questions.dto'

type QuestionsListResponse = {
  items: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: ListQuestionsQueryDto): Promise<QuestionsListResponse> {
    const page = query.page
    const limit = query.limit
    const includeAnswers = query.includeAnswers
    const answersLimit = query.answersLimit

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
                include: { author: { select: { id: true, name: true } } },
              }
            : false,
        },
      }),
    ])

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

    const items = questions.map((question) => {
      const { _count, ...rest } = question as any

      return {
        ...rest,
        answersCount: _count.answers,
      }
    })

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

  async findOneOrThrow(id: string) {
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

  async create(dto: CreateQuestionDto, authorId: string) {
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

  async update(id: string, dto: UpdateQuestionDto, currentUser: JwtPayload) {
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
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === 'P2025'
      ) {
        throw new NotFoundException(`Question ${id} not found`)
      }

      throw error
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      await this.prismaService.question.delete({ where: { id } })
      return { deleted: true }
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === 'P2025'
      ) {
        return { deleted: false }
      }

      throw error
    }
  }
}
