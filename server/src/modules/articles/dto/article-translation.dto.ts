import { ApiProperty } from "@nestjs/swagger";
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
}
