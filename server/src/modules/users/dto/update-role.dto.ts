import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Role } from "@prisma/client";

export class UpdateRoleDto {
  @ApiProperty({ enum: Role, description: "New role to assign" })
  @IsEnum(Role)
  role!: Role;
}
