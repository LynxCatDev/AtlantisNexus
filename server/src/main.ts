import { ValidationPipe, RequestMethod } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { normalizeRoutePrefix, parseCsv, parsePort } from "./common/utils/env.utils";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const apiPrefix = normalizeRoutePrefix(config.get<string>("app.apiPrefix", "/api/v1"));

  app.enableCors({
    origin: parseCsv(config.get<string>("app.corsOrigins"), [
      "http://localhost:4000",
      "http://127.0.0.1:4000",
    ]),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(apiPrefix, {
    exclude: [{ path: "/", method: RequestMethod.GET }],
  });

  const port = parsePort(config.get<string>("app.port"), 4000);
  await app.listen(port, "127.0.0.1");
}

void bootstrap();
