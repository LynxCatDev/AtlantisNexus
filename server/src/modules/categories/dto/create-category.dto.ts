import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ example: "indie", minLength: 2, maxLength: 48 })
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: "slug must be lowercase letters, digits, or hyphens",
  })
  slug!: string;

  @ApiProperty({ example: "Indie", minLength: 1, maxLength: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label!: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
