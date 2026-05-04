import { Transform } from "class-transformer";
import { IsEmail, IsISO8601, IsOptional, IsString, Length } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(2, 32)
  nickname?: string;

  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" && value.trim() === "" ? null : value))
  avatar?: string | null;
}
