import { ApiProperty } from "@nestjs/swagger";
import { Locale } from "@prisma/client";
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;

  @ApiProperty({ enum: Locale, description: "Locale the comment was written in" })
  @IsEnum(Locale)
  locale!: Locale;
}
