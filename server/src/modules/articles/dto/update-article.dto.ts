import { ApiPropertyOptional } from "@nestjs/swagger";
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
  @ApiPropertyOptional({ minLength: 2, maxLength: 160 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug?: string;

  @ApiPropertyOptional({ description: "Slug of an existing category" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: "categorySlug must be lowercase letters, digits, or hyphens",
  })
  categorySlug?: string;

  @ApiPropertyOptional({ maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  minutes?: string;

  @ApiPropertyOptional({ description: "Cover image URL", maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string;

  @ApiPropertyOptional({ type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: () => [ArticleTranslationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationDto)
  translations?: ArticleTranslationDto[];
}
