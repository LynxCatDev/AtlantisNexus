import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Role } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { PrismaService } from "../../../database/prisma.service";

type JwtPayload = {
  sub: string;
  email: string;
  nickname: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("jwt.accessSecret", "dev-access-secret-change-me"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, nickname: true, role: true, avatar: true },
    });

    if (!user) {
      throw new UnauthorizedException("Session no longer valid");
    }

    return user;
  }
}
