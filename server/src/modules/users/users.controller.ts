import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Role } from "@prisma/client";
import "multer";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findById(user.id);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Post("me/avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.users.setAvatarFromUpload(user.id, file);
  }

  @Delete("me/avatar")
  removeAvatar(@CurrentUser() user: AuthenticatedUser) {
    return this.users.clearAvatar(user.id);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  list() {
    return this.users.listAll();
  }

  @Patch(":id/role")
  @Roles(Role.SUPERADMIN)
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.updateRole(id, dto.role, actor.id);
  }
}
