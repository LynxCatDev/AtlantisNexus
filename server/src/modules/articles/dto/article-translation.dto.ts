import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Locale } from "@prisma/client";

import { ArticleSectionDto } from "./article-section.dto";

export class ArticleTranslationDto {
  @ApiProperty({ enum: Locale })
  @IsEnum(Locale)
  locale!: Locale;

  @ApiProperty({ minLength: 2, maxLength: 200 })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  excerpt!: string;

  @ApiProperty({ type: () => [ArticleSectionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArticleSectionDto)
  sections!: ArticleSectionDto[];

  @ApiPropertyOptional({ maxLength: 200, description: "SEO meta title (falls back to title)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional({ maxLength: 300, description: "SEO meta description (falls back to excerpt)" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String], maxItems: 30, description: "SEO keywords for this locale" })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  keywords?: string[];
}
