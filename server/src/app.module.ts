import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "./config/app.config";
import { DatabaseModule } from "./database/database.module";
import { AppFeatureModule } from "./modules/app/app.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    AppFeatureModule,
    HealthModule,
  ],
})
export class AppModule {}
