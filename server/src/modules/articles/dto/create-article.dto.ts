import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

import { ArticleTranslationDto } from "./article-translation.dto";

export class CreateArticleDto {
  @ApiProperty({ example: "my-first-article", minLength: 2, maxLength: 160 })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug!: string;

  @ApiProperty({ example: "dev", description: "Slug of an existing category" })
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: "categorySlug must be lowercase letters, digits, or hyphens",
  })
  categorySlug!: string;

  @ApiProperty({ example: "5 min", maxLength: 16 })
  @IsString()
  @MaxLength(16)
  minutes!: string;

  @ApiProperty({ description: "Cover image URL", maxLength: 2048 })
  @IsString()
  @MaxLength(2048)
  image!: string;

  @ApiPropertyOptional({ type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    type: () => [ArticleTranslationDto],
    description: "Must include at least one translation; English is required",
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationDto)
  translations!: ArticleTranslationDto[];
}
