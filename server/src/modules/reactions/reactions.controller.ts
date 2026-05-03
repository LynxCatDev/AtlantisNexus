import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { ToggleReactionDto } from "./dto/toggle-reaction.dto";
import { ReactionsService } from "./reactions.service";

@Controller("articles/:slug/reactions")
export class ReactionsController {
  constructor(private readonly reactions: ReactionsService) {}

  @Get()
  summary(@Param("slug") slug: string) {
    return this.reactions.summary(slug, null);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param("slug") slug: string,
    @Body() dto: ToggleReactionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reactions.toggle(slug, user.id, dto.type);
  }
}
