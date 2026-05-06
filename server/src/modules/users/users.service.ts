import { randomBytes } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import sharp from "sharp";

import { PrismaService } from "../../database/prisma.service";
import { OBJECT_STORAGE } from "../storage/storage.module";
import type { ObjectStorage } from "../storage/storage.types";

import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { ChangePasswordDto } from "./dto/change-password.dto";
import type { ListUsersQueryDto } from "./dto/list-users-query.dto";

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  nickname: true,
  role: true,
  avatar: true,
  emailVerifiedAt: true,
  createdAt: true,
} as const;

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_OUTPUT_SIZE = 512;
const ALLOWED_AVATAR_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const BCRYPT_ROUNDS = 12;

type PublicUser = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  avatar: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

type PaginatedUsers = {
  items: PublicUser[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureSuperadmin();
  }

  async ensureSuperadmin(): Promise<void> {
    const email = this.config.get<string>("superadmin.email", "");
    const password = this.config.get<string>("superadmin.password", "");
    const nickname = this.config.get<string>("superadmin.nickname", "");

    if (!email || !password || !nickname) {
      this.logger.warn(
        "Superadmin envs missing (SUPERADMIN_EMAIL/PASSWORD/NICKNAME); skipping bootstrap.",
      );
      return;
    }

    const existingSuper = await this.prisma.user.findFirst({
      where: { role: Role.SUPERADMIN },
      select: { id: true, emailVerifiedAt: true },
    });

    if (existingSuper) {
      if (!existingSuper.emailVerifiedAt) {
        await this.prisma.user.update({
          where: { id: existingSuper.id },
          data: { emailVerifiedAt: new Date() },
        });
      }
      return;
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      await this.prisma.user.update({
        where: { id: byEmail.id },
        data: { role: Role.SUPERADMIN, emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date() },
      });
      this.logger.log(`Promoted existing user ${email} to SUPERADMIN.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.prisma.user.create({
      data: {
        email,
        nickname,
        passwordHash,
        role: Role.SUPERADMIN,
        emailVerifiedAt: new Date(),
      },
    });
    this.logger.log(`Created SUPERADMIN account ${email}.`);
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async list(query: ListUsersQueryDto): Promise<PaginatedUsers> {
    const page = normalizePositiveInt(query.page, 1);
    const pageSize = Math.min(normalizePositiveInt(query.pageSize, 20), 100);
    const search = query.q?.trim();
    const filters: Prisma.UserWhereInput[] = [];

    if (search) {
      filters.push({
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { nickname: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (query.role) {
      filters.push({ role: query.role });
    }

    const where: Prisma.UserWhereInput = filters.length > 0 ? { AND: filters } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: PUBLIC_USER_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async updateRole(targetId: string, role: Role, actorId: string): Promise<PublicUser> {
    if (role === Role.SUPERADMIN) {
      throw new ForbiddenException("Cannot grant SUPERADMIN via this endpoint");
    }

    if (targetId === actorId) {
      throw new BadRequestException("Cannot change your own role");
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, emailVerifiedAt: true },
    });

    if (!target) {
      throw new NotFoundException("User not found");
    }

    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenException("Cannot modify a SUPERADMIN");
    }

    if (role === Role.ADMIN && !target.emailVerifiedAt) {
      throw new BadRequestException("User must verify their email before becoming an admin");
    }

    if (target.role === role) {
      return this.findById(targetId);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: targetId },
        data: { role },
        select: PUBLIC_USER_SELECT,
      }),
      this.prisma.roleChangeAudit.create({
        data: {
          actorId,
          targetId,
          fromRole: target.role,
          toRole: role,
        },
      }),
    ]);

    return updated;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const data: {
      nickname?: string;
      avatar?: string | null;
    } = {};

    if (dto.nickname !== undefined) {
      data.nickname = dto.nickname;
    }
    if (dto.avatar !== undefined) {
      data.avatar = dto.avatar;
    }

    if (dto.email !== undefined) {
      const current = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (!current) {
        throw new NotFoundException("User not found");
      }

      if (dto.email !== current.email) {
        throw new BadRequestException(
          "Email changes are paused until the confirmation flow is ready",
        );
      }
    }

    if (Object.keys(data).length === 0) {
      return this.findById(userId);
    }

    if (data.nickname) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              nickname: data.nickname,
            },
          ],
        },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException("Nickname already in use");
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: PUBLIC_USER_SELECT,
    });

    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException("New password must be different from the current password");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const validCurrent = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!validCurrent) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true },
    });
  }

  async setAvatarFromUpload(
    userId: string,
    file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ): Promise<PublicUser> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException("Image too large (max 5 MB)");
    }
    if (!ALLOWED_AVATAR_MIMES.has(file.mimetype)) {
      throw new BadRequestException("Unsupported image type (use JPEG, PNG, or WebP)");
    }

    let processed: Buffer;
    try {
      processed = await sharp(file.buffer)
        .rotate()
        .resize(AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE, {
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: 86 })
        .toBuffer();
    } catch {
      throw new BadRequestException("Image could not be processed");
    }

    const key = `avatars/${userId}/${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;
    const stored = await this.storage.put({
      key,
      body: processed,
      contentType: "image/webp",
    });

    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: stored.url },
      select: PUBLIC_USER_SELECT,
    });

    if (previous?.avatar) {
      const previousKey = this.extractStorageKey(previous.avatar);
      if (previousKey) {
        void this.storage.delete(previousKey);
      }
    }

    return updated;
  }

  async clearAvatar(userId: string): Promise<PublicUser> {
    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: PUBLIC_USER_SELECT,
    });

    if (previous?.avatar) {
      const previousKey = this.extractStorageKey(previous.avatar);
      if (previousKey) {
        void this.storage.delete(previousKey);
      }
    }

    return updated;
  }

  private extractStorageKey(url: string): string | null {
    const localBase = this.config.get<string>("storage.localPublicBase", "");
    const r2Base = this.config.get<string>("storage.r2.publicUrlBase", "");
    for (const base of [localBase, r2Base]) {
      if (base && url.startsWith(base)) {
        return url.slice(base.replace(/\/+$/, "").length).replace(/^\/+/, "");
      }
    }
    return null;
  }
}

function normalizePositiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
}
