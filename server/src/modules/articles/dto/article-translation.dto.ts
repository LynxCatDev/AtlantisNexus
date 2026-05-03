import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Locale } from "@prisma/client";

import { ArticleSectionDto } from "./article-section.dto";

export class ArticleTranslationDto {
  @IsEnum(Locale)
  locale!: Locale;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(500)
  excerpt!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArticleSectionDto)
  sections!: ArticleSectionDto[];
}
