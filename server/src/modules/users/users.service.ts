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
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import sharp from "sharp";

import { PrismaService } from "../../database/prisma.service";
import { OBJECT_STORAGE } from "../storage/storage.module";
import type { ObjectStorage } from "../storage/storage.types";

import type { UpdateProfileDto } from "./dto/update-profile.dto";

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  nickname: true,
  role: true,
  avatar: true,
  dateOfBirth: true,
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
  dateOfBirth: Date | null;
  createdAt: Date;
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
      select: { id: true },
    });

    if (existingSuper) {
      return;
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      await this.prisma.user.update({
        where: { id: byEmail.id },
        data: { role: Role.SUPERADMIN },
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

  async listAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: PUBLIC_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
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
      select: { id: true, role: true },
    });

    if (!target) {
      throw new NotFoundException("User not found");
    }

    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenException("Cannot modify a SUPERADMIN");
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { role },
      select: PUBLIC_USER_SELECT,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const data: {
      email?: string;
      nickname?: string;
      dateOfBirth?: Date | null;
      avatar?: string | null;
    } = {};

    if (dto.email !== undefined) {
      data.email = dto.email;
    }
    if (dto.nickname !== undefined) {
      data.nickname = dto.nickname;
    }
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = new Date(dto.dateOfBirth);
    }
    if (dto.avatar !== undefined) {
      data.avatar = dto.avatar;
    }

    if (Object.keys(data).length === 0) {
      return this.findById(userId);
    }

    if (data.email || data.nickname) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(data.email ? [{ email: data.email }] : []),
                ...(data.nickname ? [{ nickname: data.nickname }] : []),
              ],
            },
          ],
        },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException("Email or nickname already in use");
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: PUBLIC_USER_SELECT,
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
