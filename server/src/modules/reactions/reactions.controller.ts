import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequiresVerifiedEmail } from "../../common/decorators/requires-verified-email.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { VerifiedEmailGuard } from "../../common/guards/verified-email.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { ToggleReactionDto } from "./dto/toggle-reaction.dto";
import { ReactionsService } from "./reactions.service";

@ApiTags("Reactions")
@ApiParam({ name: "slug" })
@Controller("articles/:slug/reactions")
export class ReactionsController {
  constructor(private readonly reactions: ReactionsService) {}

  @Get()
  @ApiOperation({ summary: "Get the reaction counts for an article" })
  summary(@Param("slug") slug: string) {
    return this.reactions.summary(slug, null);
  }

  @Post()
  @UseGuards(JwtAuthGuard, VerifiedEmailGuard)
  @RequiresVerifiedEmail()
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Toggle a reaction on an article (verified email required)" })
  toggle(
    @Param("slug") slug: string,
    @Body() dto: ToggleReactionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reactions.toggle(slug, user.id, dto.type);
  }
}
