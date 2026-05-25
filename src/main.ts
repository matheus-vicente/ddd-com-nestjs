import { NestFactory } from "@nestjs/core";

import { AppModule } from "@infra/http/app.module.js";
import { GlobalExceptionFilter } from "@infra/filters/global-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
