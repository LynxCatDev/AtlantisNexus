import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { ReactionType } from "@prisma/client";

export class ToggleReactionDto {
  @ApiProperty({ enum: ReactionType, description: "Reaction type to toggle" })
  @IsEnum(ReactionType)
  type!: ReactionType;
}
