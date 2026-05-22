import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

import { ArticleSectionDto } from "./article-section.dto";

export class UpsertTranslationDto {
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
