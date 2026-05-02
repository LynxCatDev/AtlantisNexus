import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

import { parsePort } from "../common/utils/env.utils";

export function createTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: config.get<string>("postgres.host", "localhost"),
    port: parsePort(config.get<string>("postgres.port"), 5432),
    username: config.get<string>("postgres.username", "atlantis"),
    password: config.get<string>("postgres.password", "atlantis"),
    database: config.get<string>("postgres.database", "atlantis_nexus"),
    autoLoadEntities: true,
    synchronize: false,
    logging: config.get<boolean>("app.debug", false),
  };
}
