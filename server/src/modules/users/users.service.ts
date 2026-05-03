import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../../database/prisma.service";

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
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        avatar: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async listAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        avatar: true,
        dateOfBirth: true,
        createdAt: true,
      },
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
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        avatar: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });
  }
}
