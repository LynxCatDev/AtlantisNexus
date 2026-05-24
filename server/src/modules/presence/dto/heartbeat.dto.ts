import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class HeartbeatDto {
  @ApiProperty({ minLength: 8, maxLength: 64, description: "Per-browser session ID" })
  @IsString()
  @Length(8, 64)
  sessionId!: string;
}
