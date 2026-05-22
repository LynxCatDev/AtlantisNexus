import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com", maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: "nexus_fan", minLength: 2, maxLength: 32 })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  nickname!: string;

  @ApiProperty({ example: "supersecret", minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ description: "URL of an avatar image", maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar?: string;
}
