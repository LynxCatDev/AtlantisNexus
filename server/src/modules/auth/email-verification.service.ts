import { createHash, randomBytes } from "node:crypto";

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { parseDurationMs } from "../../common/utils/env.utils";
import { PrismaService } from "../../database/prisma.service";
import { MAIL_SERVICE } from "../mail/mail.module";
import type { MailService } from "../mail/mail.types";

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

type IssueTarget = {
  id: string;
  email: string;
  nickname: string;
};

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(MAIL_SERVICE) private readonly mail: MailService,
  ) {}

  async issueAndSend(user: IssueTarget): Promise<void> {
    const recent = await this.prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, expiresAt: true },
    });

    const now = Date.now();
    if (
      recent &&
      recent.expiresAt.getTime() > now &&
      now - recent.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = this.hash(rawToken);
    const ttlMs = parseDurationMs(
      this.config.get<string>("verification.tokenTtl", "24h"),
      DEFAULT_TTL_MS,
    );
    const expiresAt = new Date(now + ttlMs);

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    await this.sendEmail(user, rawToken);
  }

  async verify(rawToken: string): Promise<void> {
    if (!rawToken || rawToken.length < 16) {
      throw new BadRequestException("Invalid verification token");
    }

    const tokenHash = this.hash(rawToken);
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        consumedAt: true,
        expiresAt: true,
      },
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("Verification token is invalid or expired");
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
  }

  async invalidateAll(userId: string): Promise<void> {
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  private hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async sendEmail(user: IssueTarget, rawToken: string): Promise<void> {
    const baseUrl = this.config
      .get<string>("verification.appBaseUrl", "http://localhost:3000")
      .replace(/\/+$/, "");
    const link = `${baseUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

    try {
      await this.mail.send({
        to: user.email,
        subject: "Verify your Atlantis Nexus email",
        text: [
          `Hi ${user.nickname},`,
          "",
          "Confirm your email address to finish setting up your Atlantis Nexus account:",
          link,
          "",
          "If you did not create this account, you can ignore this message.",
        ].join("\n"),
      });
    } catch (err) {
      this.logger.error(
        `Failed to send verification email to ${user.email}: ${(err as Error).message}`,
      );
    }
  }
}
