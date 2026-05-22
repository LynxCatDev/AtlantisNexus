import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({ description: "Email verification token from the verification link", minLength: 16, maxLength: 256 })
  @IsString()
  @MinLength(16)
  @MaxLength(256)
  token!: string;
}
