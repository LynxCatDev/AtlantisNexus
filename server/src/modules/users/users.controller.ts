import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "@prisma/client";
import "multer";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { ChangePasswordDto } from "./dto/change-password.dto";
import { ListUsersQueryDto } from "./dto/list-users-query.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get the current user's profile" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findById(user.id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update the current user's profile" })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch("me/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Change the current user's password" })
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(user.id, dto);
  }

  @Post("me/avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: "Upload a new avatar image (max 5MB)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.users.setAvatarFromUpload(user.id, file);
  }

  @Delete("me/avatar")
  @ApiOperation({ summary: "Remove the current user's avatar" })
  removeAvatar(@CurrentUser() user: AuthenticatedUser) {
    return this.users.clearAvatar(user.id);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "List users (admin)" })
  list(@Query() query: ListUsersQueryDto) {
    return this.users.list(query);
  }

  @Patch(":id/role")
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Change a user's role (superadmin only)" })
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.updateRole(id, dto.role, actor.id);
  }
}
