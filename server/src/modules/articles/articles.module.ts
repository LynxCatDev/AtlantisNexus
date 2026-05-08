import { Module } from "@nestjs/common";

import { CategoriesModule } from "../categories/categories.module";
import { StorageModule } from "../storage/storage.module";

import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";

@Module({
  imports: [CategoriesModule, StorageModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
