import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./common/prisma.service";
import { validateEnv } from "./shared/config/env.validation";

async function bootstrap(): Promise<void> {
  validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(3002);
}

void bootstrap();
