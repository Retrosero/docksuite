import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { validateEnv } from "./shared/config/env.validation";

async function bootstrap(): Promise<void> {
  validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(3002);
}

void bootstrap();
