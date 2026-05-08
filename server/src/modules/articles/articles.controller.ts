import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Locale, Role } from "@prisma/client";
import "multer";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { UpsertTranslationDto } from "./dto/upsert-translation.dto";

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  list(@Query("locale") locale?: string) {
    return this.articles.list(parseLocale(locale));
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string, @Query("locale") locale?: string) {
    return this.articles.getBySlug(slug, parseLocale(locale));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  create(@Body() dto: CreateArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.articles.create(dto, user.id);
  }

  @Post("cover-image")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  uploadCoverImage(@UploadedFile() file: Express.Multer.File) {
    return this.articles.uploadCoverImage(file);
  }

  @Patch(":slug")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  update(@Param("slug") slug: string, @Body() dto: UpdateArticleDto) {
    return this.articles.update(slug, dto);
  }

  @Delete(":slug")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("slug") slug: string) {
    return this.articles.remove(slug);
  }

  @Put(":slug/translations/:locale")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  upsertTranslation(
    @Param("slug") slug: string,
    @Param("locale") localeParam: string,
    @Body() dto: UpsertTranslationDto,
  ) {
    return this.articles.upsertTranslation(slug, parseLocaleStrict(localeParam), dto);
  }

  @Delete(":slug/translations/:locale")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTranslation(@Param("slug") slug: string, @Param("locale") localeParam: string) {
    return this.articles.removeTranslation(slug, parseLocaleStrict(localeParam));
  }
}

function parseLocale(value: string | undefined): Locale {
  if (!value) {
    return Locale.en;
  }
  const candidate = value.toLowerCase();
  return (Object.values(Locale) as string[]).includes(candidate)
    ? (candidate as Locale)
    : Locale.en;
}

function parseLocaleStrict(value: string): Locale {
  const candidate = value.toLowerCase();
  if (!(Object.values(Locale) as string[]).includes(candidate)) {
    throw new BadRequestException(`Unsupported locale "${value}"`);
  }
  return candidate as Locale;
}
