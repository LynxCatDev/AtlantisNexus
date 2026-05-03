import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "./config/app.config";
import { DatabaseModule } from "./database/database.module";
import { AppFeatureModule } from "./modules/app/app.module";
import { ArticlesModule } from "./modules/articles/articles.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { HealthModule } from "./modules/health/health.module";
import { ReactionsModule } from "./modules/reactions/reactions.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    AppFeatureModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ArticlesModule,
    CommentsModule,
    ReactionsModule,
  ],
})
export class AppModule {}
