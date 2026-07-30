import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'

export function setupSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Questions API')
    .setDescription('QA Backend API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const openApiDoc = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc), {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs.json',
    yamlDocumentUrl: 'docs.yaml',
  })
}
