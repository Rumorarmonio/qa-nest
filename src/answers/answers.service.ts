import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { AnswerEntity } from '@/answers/answer.entity'
import { CreateAnswerDto, UpdateAnswerDto } from '@/answers/answers.dto'
import { QuestionEntity } from '@/questions/question.entity'

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
      relations: { author: true },
      order: { isBest: 'DESC', createdAt: 'ASC' },
    })
  }

  async findOneOrThrow(id: string): Promise<AnswerEntity> {
    const answer = await this.answersRepository.findOne({
      where: { id },
      relations: { author: true },
    })

    if (!answer) {
      throw new NotFoundException(`Answer ${id} not found`)
    }

    return answer
  }

  async create(questionId: string, dto: CreateAnswerDto, authorId: string): Promise<AnswerEntity> {
    await this.ensureQuestionExists(questionId)

    return this.dataSource.transaction(async (transactionManager) => {
      const answersRepository = transactionManager.getRepository(AnswerEntity)

      if (dto.isBest === true) {
        await answersRepository.update({ questionId, isBest: true }, { isBest: false })
      }

      const answer = answersRepository.create({
        questionId,
        authorId,
        answerText: dto.answerText,
        isBest: dto.isBest ?? false,
      })

      const saved = await answersRepository.save(answer)

      return answersRepository.findOneOrFail({
        where: { id: saved.id },
        relations: { author: true },
      })
    })
  }

  async update(id: string, dto: UpdateAnswerDto): Promise<AnswerEntity> {
    const answer = await this.findOneOrThrow(id)

    if (dto.answerText !== undefined) {
      answer.answerText = dto.answerText
    }

    const saved = await this.answersRepository.save(answer)

    return this.answersRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { author: true },
    })
  }

  async markBest(id: string): Promise<AnswerEntity> {
    return this.dataSource.transaction(async (transactionManager) => {
      const answersRepository = transactionManager.getRepository(AnswerEntity)

      const answer = await answersRepository.findOne({ where: { id } })

      if (!answer) {
        throw new NotFoundException(`Answer ${id} not found`)
      }

      await answersRepository.update(
        { questionId: answer.questionId, isBest: true },
        { isBest: false },
      )

      answer.isBest = true

      const saved = await answersRepository.save(answer)

      return answersRepository.findOneOrFail({
        where: { id: saved.id },
        relations: { author: true },
      })
    })
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.answersRepository.delete({ id })
    return { deleted: (result.affected ?? 0) > 0 }
  }

  private async ensureQuestionExists(questionId: string): Promise<void> {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      select: { id: true },
    })

    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`)
    }
  }
}
