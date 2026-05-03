import { randomBytes, createHash } from "node:crypto";

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";
import { PrismaService } from "../../database/prisma.service";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const BCRYPT_ROUNDS = 12;

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<IssuedTokens> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { nickname: dto.nickname }] },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Email or nickname already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        passwordHash,
        avatar: dto.avatar,
        dateOfBirth: dto.dateOfBirth,
        role: Role.USER,
      },
      select: { id: true, email: true, nickname: true, role: true },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<IssuedTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueTokens({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    });
  }

  async refresh(rawRefreshToken: string | undefined): Promise<IssuedTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const tokenHash = this.hashRefreshToken(rawRefreshToken);

    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, nickname: true, role: true },
        },
      },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      if (record && !record.revokedAt) {
        await this.prisma.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException("Refresh token invalid or expired");
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(record.user);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  validateSession(user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  private async issueTokens(user: AuthenticatedUser): Promise<IssuedTokens> {
    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
      {
        secret: this.config.get<string>("jwt.accessSecret"),
        expiresIn: this.config.get<string>("jwt.accessTtl", "15m") as unknown as number,
      },
    );

    const refreshToken = randomBytes(64).toString("hex");
    const tokenHash = this.hashRefreshToken(refreshToken);
    const refreshTtl = this.config.get<string>("jwt.refreshTtl", "7d");
    const expiresAt = new Date(Date.now() + this.parseDuration(refreshTtl));

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt: expiresAt, user };
  }

  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private parseDuration(value: string): number {
    const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? "s";
    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * unitMs[unit];
  }
}
