import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Locale, Prisma } from "@prisma/client";

import { PrismaService } from "../../database/prisma.service";
import { CategoriesService } from "../categories/categories.service";

import { ArticleTranslationDto } from "./dto/article-translation.dto";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { UpsertTranslationDto } from "./dto/upsert-translation.dto";

const DEFAULT_LOCALE: Locale = Locale.en;

type CategoryView = { slug: string; label: string; isMain: boolean };

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
  ) {}

  async list(locale: Locale) {
    const articles = await this.prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, nickname: true } },
        category: { select: { slug: true, label: true, isMain: true } },
        translations: true,
        _count: { select: { comments: true, reactions: true } },
      },
    });

    return articles.map((article) => {
      const translation = pickTranslation(article.translations, locale);
      return {
        id: article.id,
        slug: article.slug,
        title: translation?.title ?? "",
        excerpt: translation?.excerpt ?? "",
        category: article.category as CategoryView,
        author: article.author.nickname,
        authorId: article.author.id,
        publishedAt: article.publishedAt,
        minutes: article.minutes,
        image: article.image,
        tags: article.tags,
        locale: translation?.locale ?? null,
        availableLocales: article.translations.map((t) => t.locale),
        counts: article._count,
      };
    });
  }

  async getBySlug(slug: string, locale: Locale) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, nickname: true } },
        category: { select: { slug: true, label: true, isMain: true } },
        translations: true,
        comments: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { user: { select: { id: true, nickname: true } } },
        },
        reactions: { select: { type: true, userId: true } },
      },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const translation = pickTranslation(article.translations, locale);
    if (!translation) {
      throw new NotFoundException("No translations available for this article");
    }

    const reactionCounts: Record<string, number> = {};
    for (const r of article.reactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1;
    }

    return {
      id: article.id,
      slug: article.slug,
      title: translation.title,
      excerpt: translation.excerpt,
      sections: translation.sections,
      locale: translation.locale,
      availableLocales: article.translations.map((t) => t.locale),
      category: article.category as CategoryView,
      author: article.author.nickname,
      authorId: article.authorId,
      publishedAt: article.publishedAt,
      minutes: article.minutes,
      image: article.image,
      tags: article.tags,
      reactions: {
        counts: reactionCounts,
        total: article.reactions.length,
      },
      comments: article.comments.map((c) => ({
        id: c.id,
        body: c.body,
        author: c.user.nickname,
        userId: c.userId,
        createdAt: c.createdAt,
      })),
    };
  }

  async create(dto: CreateArticleDto, authorId: string) {
    this.assertEnglishTranslation(dto.translations);
    this.assertUniqueLocales(dto.translations);

    const category = await this.categories.findBySlugOrThrow(dto.categorySlug);

    const exists = await this.prisma.article.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException("Article slug already exists");
    }

    return this.prisma.article.create({
      data: {
        slug: dto.slug,
        categoryId: category.id,
        minutes: dto.minutes,
        image: dto.image,
        tags: dto.tags ?? [],
        authorId,
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            sections: t.sections as unknown as Prisma.InputJsonValue,
          })),
        },
      },
      include: { translations: true, category: true },
    });
  }

  async update(slug: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (dto.translations) {
      this.assertUniqueLocales(dto.translations);
    }

    let categoryId: string | undefined;
    if (dto.categorySlug) {
      const category = await this.categories.findBySlugOrThrow(dto.categorySlug);
      categoryId = category.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: article.id },
        data: {
          slug: dto.slug,
          categoryId,
          minutes: dto.minutes,
          image: dto.image,
          tags: dto.tags,
        },
      });

      if (dto.translations) {
        for (const t of dto.translations) {
          await tx.articleTranslation.upsert({
            where: { articleId_locale: { articleId: article.id, locale: t.locale } },
            create: {
              articleId: article.id,
              locale: t.locale,
              title: t.title,
              excerpt: t.excerpt,
              sections: t.sections as unknown as Prisma.InputJsonValue,
            },
            update: {
              title: t.title,
              excerpt: t.excerpt,
              sections: t.sections as unknown as Prisma.InputJsonValue,
            },
          });
        }
      }

      return updated;
    });
  }

  async remove(slug: string): Promise<void> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    await this.prisma.article.delete({ where: { id: article.id } });
  }

  async upsertTranslation(slug: string, locale: Locale, dto: UpsertTranslationDto) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return this.prisma.articleTranslation.upsert({
      where: { articleId_locale: { articleId: article.id, locale } },
      create: {
        articleId: article.id,
        locale,
        title: dto.title,
        excerpt: dto.excerpt,
        sections: dto.sections as unknown as Prisma.InputJsonValue,
      },
      update: {
        title: dto.title,
        excerpt: dto.excerpt,
        sections: dto.sections as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async removeTranslation(slug: string, locale: Locale): Promise<void> {
    if (locale === DEFAULT_LOCALE) {
      throw new BadRequestException("Cannot delete the default English translation");
    }

    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    try {
      await this.prisma.articleTranslation.delete({
        where: { articleId_locale: { articleId: article.id, locale } },
      });
    } catch {
      throw new NotFoundException("Translation not found");
    }
  }

  private assertEnglishTranslation(translations: ArticleTranslationDto[]): void {
    if (!translations.some((t) => t.locale === DEFAULT_LOCALE)) {
      throw new BadRequestException("Articles must include an English (en) translation");
    }
  }

  private assertUniqueLocales(translations: ArticleTranslationDto[]): void {
    const seen = new Set<Locale>();
    for (const t of translations) {
      if (seen.has(t.locale)) {
        throw new BadRequestException(`Duplicate translation for locale "${t.locale}"`);
      }
      seen.add(t.locale);
    }
  }
}

function pickTranslation<T extends { locale: Locale }>(
  translations: T[],
  preferred: Locale,
): T | undefined {
  return (
    translations.find((t) => t.locale === preferred) ??
    translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    translations[0]
  );
}
