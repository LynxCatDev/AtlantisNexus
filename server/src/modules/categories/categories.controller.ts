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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";

import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List all categories" })
  list() {
    return this.categories.list();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create an extra category (superadmin only)" })
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }

  @Patch(":slug")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an extra category (superadmin only)" })
  @ApiParam({ name: "slug" })
  update(@Param("slug") slug: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(slug, dto);
  }

  @Delete(":slug")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an extra category (superadmin only)" })
  @ApiParam({ name: "slug" })
  remove(@Param("slug") slug: string) {
    return this.categories.remove(slug);
  }
}
