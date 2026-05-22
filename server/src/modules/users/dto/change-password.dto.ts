import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  currentPassword!: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  newPassword!: string;
}
