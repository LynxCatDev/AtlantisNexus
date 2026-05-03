import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";

export class ArticleSectionDto {
  @IsString()
  @MaxLength(64)
  id!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paragraphs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bullets?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  quote?: string;
}
