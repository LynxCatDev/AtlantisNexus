import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

const MAIN_CATEGORIES: ReadonlyArray<{ slug: string; label: string; position: number }> = [
  { slug: "dev", label: "Dev", position: 0 },
  { slug: "ai", label: "AI", position: 1 },
  { slug: "gaming", label: "Gaming", position: 2 },
];

export const MAIN_CATEGORY_SLUGS: ReadonlySet<string> = new Set(
  MAIN_CATEGORIES.map((c) => c.slug),
);

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedMainCategories();
  }

  async seedMainCategories(): Promise<void> {
    for (const c of MAIN_CATEGORIES) {
      await this.prisma.category.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, label: c.label, isMain: true, position: c.position },
        update: { isMain: true, position: c.position },
      });
    }
    this.logger.log(`Ensured main categories: ${MAIN_CATEGORIES.map((c) => c.slug).join(", ")}`);
  }

  async list() {
    return this.prisma.category.findMany({
      orderBy: [{ isMain: "desc" }, { position: "asc" }, { label: "asc" }],
      select: {
        id: true,
        slug: true,
        label: true,
        isMain: true,
        position: true,
      },
    });
  }

  async findBySlugOrThrow(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    if (MAIN_CATEGORY_SLUGS.has(dto.slug.toLowerCase())) {
      throw new ConflictException(
        `Slug "${dto.slug}" is reserved for a main category`,
      );
    }

    const exists = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });
    if (exists) {
      throw new ConflictException("Category slug already exists");
    }

    return this.prisma.category.create({
      data: {
        slug: dto.slug,
        label: dto.label,
        isMain: false,
        position: dto.position ?? 0,
      },
    });
  }

  async update(slug: string, dto: UpdateCategoryDto) {
    const category = await this.findBySlugOrThrow(slug);

    if (category.isMain) {
      throw new ForbiddenException("Main categories cannot be modified");
    }

    return this.prisma.category.update({
      where: { id: category.id },
      data: {
        label: dto.label,
        position: dto.position,
      },
    });
  }

  async remove(slug: string): Promise<void> {
    const category = await this.findBySlugOrThrow(slug);

    if (category.isMain) {
      throw new ForbiddenException("Main categories cannot be deleted");
    }

    const inUse = await this.prisma.article.count({ where: { categoryId: category.id } });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete category "${slug}": ${inUse} article(s) still reference it`,
      );
    }

    await this.prisma.category.delete({ where: { id: category.id } });
  }
}
