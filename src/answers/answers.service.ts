import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import type { JwtPayload } from '@/auth/jwt-payload.type'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateAnswerDto, UpdateAnswerDto } from '@/answers/answers.dto'

@Injectable()
export class AnswersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByQuestion(questionId: string) {
    const questionExists = await this.prismaService.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    })

    if (!questionExists) {
      throw new NotFoundException(`Question ${questionId} not found`)
    }

    return this.prismaService.answer.findMany({
      where: { questionId },
      orderBy: [{ isBest: 'desc' }, { createdAt: 'asc' }],
      include: { author: { select: { id: true, name: true } } },
    })
  }

  async findOneOrThrow(id: string) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    return answer
  }

  async create(questionId: string, dto: CreateAnswerDto, authorId: string) {
    const questionExists = await this.prismaService.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    })

    if (!questionExists) {
      throw new NotFoundException(`Question ${questionId} not found`)
    }

    const [created] = await this.prismaService.$transaction(async (tx) => {
      if (dto.isBest === true) {
        await tx.answer.updateMany({
          where: { questionId, isBest: true },
          data: { isBest: false },
        })
      }

      const answer = await tx.answer.create({
        data: {
          questionId,
          authorId,
          answerText: dto.answerText,
          isBest: dto.isBest ?? false,
        },
        include: { author: { select: { id: true, name: true } } },
      })

      return [answer] as const
    })

    return created
  }

  async update(id: string, dto: UpdateAnswerDto, currentUser: JwtPayload) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    if (answer.authorId !== currentUser.sub && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own answer')
    }

    try {
      return await this.prismaService.answer.update({
        where: { id },
        data: {
          answerText: dto.answerText ?? undefined,
        },
        include: { author: { select: { id: true, name: true } } },
      })
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === 'P2025'
      ) {
        throw new NotFoundException(`Answer ${id} not found`)
      }

      throw error
    }
  }

  async markBest(id: string) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
      select: { id: true, questionId: true },
    })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    const updated = await this.prismaService.$transaction(async (tx) => {
      await tx.answer.updateMany({
        where: { questionId: answer.questionId, isBest: true },
        data: { isBest: false },
      })

      return tx.answer.update({
        where: { id: answer.id },
        data: { isBest: true },
        include: { author: { select: { id: true, name: true } } },
      })
    })

    return updated
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      await this.prismaService.answer.delete({ where: { id } })
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
