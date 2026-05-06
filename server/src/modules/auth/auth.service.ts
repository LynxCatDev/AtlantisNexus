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
import { parseDurationMs } from "../../common/utils/env.utils";
import { PrismaService } from "../../database/prisma.service";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { EmailVerificationService } from "./email-verification.service";

const BCRYPT_ROUNDS = 12;
const TIMING_EQUALIZER_PASSWORD = "__timing-equalizer__";

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  private dummyHashPromise: Promise<string> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async register(dto: RegisterDto): Promise<IssuedTokens> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { nickname: dto.nickname }] },
      select: { id: true, email: true, nickname: true },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException({
          statusCode: 409,
          code: "EMAIL_TAKEN",
          message: "An account with this email already exists",
          error: "Conflict",
        });
      }
      throw new ConflictException({
        statusCode: 409,
        code: "NICKNAME_TAKEN",
        message: "This nickname is already taken",
        error: "Conflict",
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        passwordHash,
        avatar: dto.avatar,
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        avatar: true,
        emailVerifiedAt: true,
      },
    });

    await this.emailVerification.issueAndSend({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    });

    return this.issueTokens(user);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, nickname: true, emailVerifiedAt: true },
    });

    if (!user || user.emailVerifiedAt) {
      return;
    }

    await this.emailVerification.issueAndSend({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.emailVerification.verify(token);
  }

  async login(dto: LoginDto): Promise<IssuedTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        avatar: true,
        emailVerifiedAt: true,
        passwordHash: true,
      },
    });

    const hashToCompare = user?.passwordHash ?? (await this.getDummyHash());
    const ok = await bcrypt.compare(dto.password, hashToCompare);

    if (!user || !ok) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueTokens({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      avatar: user.avatar,
      emailVerifiedAt: user.emailVerifiedAt,
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
          select: {
            id: true,
            email: true,
            nickname: true,
            role: true,
            avatar: true,
            emailVerifiedAt: true,
          },
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
    const expiresAt = new Date(
      Date.now() + parseDurationMs(refreshTtl, 7 * 24 * 60 * 60 * 1000),
    );

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

  private getDummyHash(): Promise<string> {
    if (!this.dummyHashPromise) {
      this.dummyHashPromise = bcrypt.hash(TIMING_EQUALIZER_PASSWORD, BCRYPT_ROUNDS);
    }
    return this.dummyHashPromise;
  }
}
