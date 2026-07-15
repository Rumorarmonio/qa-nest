import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'

import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { setupAdminPanel } from '@/admin/admin.setup'

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

  const prismaService = app.get(PrismaService)
  const { admin, router } = await setupAdminPanel(prismaService)
  app.use(admin.options.rootPath, router)

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

bootstrap()
