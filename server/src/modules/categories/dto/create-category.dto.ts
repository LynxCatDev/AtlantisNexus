import { IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: "slug must be lowercase letters, digits, or hyphens",
  })
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
