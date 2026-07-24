import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UserRole } from '@prisma/client'

import type { JwtPayload } from '@/auth/jwt-payload.type'
import { hasPrismaErrorCode } from '@/common/prisma-error'
import type { DeleteResult } from '@/common/schemas/common.schema'
import type { Answer } from '@/common/schemas/answer.schema'
import type { CreateAnswerInput, UpdateAnswerInput } from '@/answers/answers.dto'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class AnswersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByQuestion(questionId: string): Promise<Answer[]> {
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
      include: { author: { select: { id: true, name: true, role: true } } },
    })
  }

  async findOneOrThrow(id: string): Promise<Answer> {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, role: true } } },
    })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    return answer
  }

  async create(questionId: string, dto: CreateAnswerInput, authorId: string): Promise<Answer> {
    const questionExists = await this.prismaService.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    })

    if (!questionExists) {
      throw new NotFoundException(`Question ${questionId} not found`)
    }

    try {
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
          include: { author: { select: { id: true, name: true, role: true } } },
        })

        return [answer] as const
      })

      return created
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException('Question already has a best answer')
      }

      throw error
    }
  }

  async update(id: string, dto: UpdateAnswerInput, currentUser: JwtPayload): Promise<Answer> {
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
        include: { author: { select: { id: true, name: true, role: true } } },
      })
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, 'P2025')) {
        throw new NotFoundException(`Answer ${id} not found`)
      }

      throw error
    }
  }

  async markBest(id: string): Promise<Answer> {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
      select: { id: true, questionId: true },
    })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        await tx.answer.updateMany({
          where: { questionId: answer.questionId, isBest: true },
          data: { isBest: false },
        })

        return tx.answer.update({
          where: { id: answer.id },
          data: { isBest: true },
          include: { author: { select: { id: true, name: true, role: true } } },
        })
      })
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException('Question already has a best answer')
      }

      throw error
    }
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      await this.prismaService.answer.delete({ where: { id } })
      return { deleted: true }
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, 'P2025')) {
        return { deleted: false }
      }

      throw error
    }
  }
}
