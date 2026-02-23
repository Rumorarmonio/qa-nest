import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { QuestionEntity } from '@/questions/question.entity'
import { AnswerEntity } from '@/answers/answer.entity'
import { CreateAnswerDto, UpdateAnswerDto } from '@/answers/answers.dto'

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly answersRepository: Repository<AnswerEntity>,

    @InjectRepository(QuestionEntity)
    private readonly questionsRepository: Repository<QuestionEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async findAllByQuestion(questionId: string): Promise<AnswerEntity[]> {
    await this.ensureQuestionExists(questionId)

    return this.answersRepository.find({
      where: { questionId },
      order: {
        isBest: 'DESC',
        createdAt: 'ASC',
      },
    })
  }

  async findOneOrThrow(id: string): Promise<AnswerEntity> {
    const answer = await this.answersRepository.findOne({ where: { id } })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    return answer
  }

  async create(questionId: string, dto: CreateAnswerDto): Promise<AnswerEntity> {
    await this.ensureQuestionExists(questionId)

    return this.dataSource.transaction(async (transactionManager) => {
      const answersRepository = transactionManager.getRepository(AnswerEntity)

      if (dto.isBest === true) {
        await answersRepository.update(
          {
            questionId,
            isBest: true,
          },
          {
            isBest: false,
          },
        )
      }

      const answer = answersRepository.create({
        questionId,
        userName: dto.userName,
        answerText: dto.answerText,
        isBest: dto.isBest ?? false,
      })

      return answersRepository.save(answer)
    })
  }

  async update(id: string, dto: UpdateAnswerDto): Promise<AnswerEntity> {
    const answer = await this.findOneOrThrow(id)

    if (dto.userName !== undefined) {
      answer.userName = dto.userName
    }

    if (dto.answerText !== undefined) {
      answer.answerText = dto.answerText
    }

    return this.answersRepository.save(answer)
  }

  async markBest(id: string): Promise<AnswerEntity> {
    return this.dataSource.transaction(async (transactionManager) => {
      const answersRepository = transactionManager.getRepository(AnswerEntity)

      const answer = await answersRepository.findOne({ where: { id } })

      if (!answer) {
        throw new NotFoundException(`Answer ${id} not found`)
      }

      await answersRepository.update(
        {
          questionId: answer.questionId,
          isBest: true,
        },
        {
          isBest: false,
        },
      )

      answer.isBest = true

      return answersRepository.save(answer)
    })
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.answersRepository.delete({ id })

    return { deleted: (result.affected ?? 0) > 0 }
  }

  private async ensureQuestionExists(questionId: string): Promise<void> {
    const question = await this.questionsRepository.findOne({
      where: {
        id: questionId,
      },
      select: {
        id: true,
      },
    })

    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`)
    }
  }
}
