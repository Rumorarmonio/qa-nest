import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'

import { HealthController } from '@/health.controller'
import { QuestionsModule } from '@/questions/questions.module'
import { AnswersModule } from '@/answers/answers.module'
import { AuthModule } from '@/auth/auth.module'
import { UsersModule } from '@/users/users.module'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,

    UsersModule,
    AuthModule,

    QuestionsModule,
    AnswersModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
