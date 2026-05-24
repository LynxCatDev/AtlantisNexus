import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";

import { HeartbeatDto } from "./dto/heartbeat.dto";
import { PresenceService } from "./presence.service";

@ApiTags("Presence")
@Controller("presence")
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  @Get()
  @ApiOperation({ summary: "Get the current online visitor count" })
  count() {
    return this.presence.count();
  }

  @Post("heartbeat")
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh this session's presence and return the live count" })
  heartbeat(@Body() dto: HeartbeatDto, @CurrentUser() user: AuthenticatedUser | null) {
    const key = user?.id ? `user:${user.id}` : `anon:${dto.sessionId}`;
    return this.presence.heartbeat(key);
  }
}
