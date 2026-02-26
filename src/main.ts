import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'

import { AppModule } from '@/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Questions API')
    .setDescription('QA Backend API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const openApiDoc = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc), {
    useGlobalPrefix: true,
  })

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

bootstrap()
