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
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: "categorySlug must be lowercase letters, digits, or hyphens",
  })
  categorySlug!: string;

  @IsString()
  @MaxLength(16)
  minutes!: string;

  @IsString()
  @MaxLength(2048)
  image!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationDto)
  translations!: ArticleTranslationDto[];
}
