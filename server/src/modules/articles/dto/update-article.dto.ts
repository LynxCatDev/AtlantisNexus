import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

import { ArticleTranslationDto } from "./article-translation.dto";

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: "categorySlug must be lowercase letters, digits, or hyphens",
  })
  categorySlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  minutes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationDto)
  translations?: ArticleTranslationDto[];
}
