import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { AnswerEntity } from '@/answers/answer.entity'
import { QuestionEntity } from '@/questions/question.entity'
import {
  CreateQuestionDto,
  ListQuestionsQueryDto,
  UpdateQuestionDto,
} from '@/questions/questions.dto'

type QuestionListItem = QuestionEntity & {
  answersCount: number
  answers?: AnswerEntity[]
}

type QuestionsListResponse = {
  items: QuestionListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepository: Repository<QuestionEntity>,

    @InjectRepository(AnswerEntity)
    private readonly answersRepository: Repository<AnswerEntity>,
  ) {}

  async findAll(query: ListQuestionsQueryDto): Promise<QuestionsListResponse> {
    const page = query.page
    const limit = query.limit
    const includeAnswers = query.includeAnswers
    const answersLimit = query.answersLimit

    const skip = (page - 1) * limit

    const [questions, total] = await this.questionsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

    if (questions.length === 0) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      }
    }

    const questionIds = questions.map((question) => question.id)

    const answerCountsRaw = await this.answersRepository
      .createQueryBuilder('answer')
      .select('answer.questionId', 'questionId')
      .addSelect('COUNT(answer.id)', 'count')
      .where('answer.questionId IN (:...questionIds)', { questionIds })
      .groupBy('answer.questionId')
      .getRawMany<{
        questionId: string
        count: string
      }>()

    const answerCountByQuestionId = new Map<string, number>(
      answerCountsRaw.map((row) => [row.questionId, Number(row.count)]),
    )

    const itemsBase: QuestionListItem[] = questions.map((question) => ({
      ...question,
      answersCount: answerCountByQuestionId.get(question.id) ?? 0,
    }))

    if (!includeAnswers) {
      return {
        items: itemsBase,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }

    const answers = await this.answersRepository.find({
      where: { questionId: In(questionIds) },
      order: {
        isBest: 'DESC',
        createdAt: 'ASC',
      },
    })

    const answersByQuestionId = new Map<string, AnswerEntity[]>()

    for (const answer of answers) {
      const currentAnswers = answersByQuestionId.get(answer.questionId) ?? []
      currentAnswers.push(answer)
      answersByQuestionId.set(answer.questionId, currentAnswers)
    }

    const itemsWithAnswers: QuestionListItem[] = itemsBase.map((question) => {
      const questionAnswers = answersByQuestionId.get(question.id) ?? []
      const limitedAnswers =
        answersLimit !== undefined ? questionAnswers.slice(0, answersLimit) : questionAnswers

      return {
        ...question,
        answers: limitedAnswers,
      }
    })

    return {
      items: itemsWithAnswers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOneOrThrow(id: string): Promise<QuestionEntity> {
    const question = await this.questionsRepository.findOne({ where: { id } })

    if (!question) {
      throw new NotFoundException(`Question ${id} not found`)
    }

    return question
  }

  async create(dto: CreateQuestionDto): Promise<QuestionEntity> {
    const question = this.questionsRepository.create({
      userName: dto.userName,
      title: dto.title,
      questionText: dto.questionText,
    })

    return this.questionsRepository.save(question)
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<QuestionEntity> {
    const question = await this.findOneOrThrow(id)

    if (dto.userName !== undefined) {
      question.userName = dto.userName
    }

    if (dto.title !== undefined) {
      question.title = dto.title
    }

    if (dto.questionText !== undefined) {
      question.questionText = dto.questionText
    }

    return this.questionsRepository.save(question)
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.questionsRepository.delete({ id })

    return { deleted: (result.affected ?? 0) > 0 }
  }
}
