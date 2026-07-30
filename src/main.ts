import { NestFactory } from '@nestjs/core'

import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { setupAdminPanel } from '@/admin/admin.setup'
import { setupSwagger } from '@/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  setupSwagger(app)

  const prismaService = app.get(PrismaService)
  const { admin, router } = await setupAdminPanel(prismaService)
  app.use(admin.options.rootPath, router)

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

bootstrap()
