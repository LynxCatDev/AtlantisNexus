import { resolve } from "node:path";

import { ValidationPipe, RequestMethod } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { normalizeRoutePrefix, parseCsv, parsePort } from "./common/utils/env.utils";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const apiPrefix = normalizeRoutePrefix(config.get<string>("app.apiPrefix", "/api/v1"));

  app.enableCors({
    origin: parseCsv(config.get<string>("app.corsOrigins"), [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]),
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(apiPrefix, {
    exclude: [{ path: "/", method: RequestMethod.GET }],
  });

  if (config.get<string>("storage.driver", "local") === "local") {
    const root = resolve(process.cwd(), config.get<string>("storage.localRoot", "uploads"));
    app.useStaticAssets(root, { prefix: "/uploads/" });
  }

  const port = parsePort(config.get<string>("app.port"), 4000);
  await app.listen(port);
}

void bootstrap();
