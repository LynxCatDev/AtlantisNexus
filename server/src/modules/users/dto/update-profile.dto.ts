import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "user@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "nexus_fan", minLength: 2, maxLength: 32 })
  @IsOptional()
  @IsString()
  @Length(2, 32)
  nickname?: string;

  @ApiPropertyOptional({
    description: "Avatar URL. Pass an empty string to clear the avatar.",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" && value.trim() === "" ? null : value))
  avatar?: string | null;
}
