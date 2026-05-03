import { Injectable, NotFoundException } from "@nestjs/common";
import { ReactionType } from "@prisma/client";

import { PrismaService } from "../../database/prisma.service";

type ReactionSummary = {
  counts: Record<string, number>;
  total: number;
  mine: ReactionType[];
};

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(slug: string, userId: string | null): Promise<ReactionSummary> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const reactions = await this.prisma.reaction.findMany({
      where: { articleId: article.id },
      select: { type: true, userId: true },
    });

    const counts: Record<string, number> = {};
    const mine: ReactionType[] = [];
    for (const r of reactions) {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
      if (userId && r.userId === userId) {
        mine.push(r.type);
      }
    }

    return { counts, total: reactions.length, mine };
  }

  async toggle(slug: string, userId: string, type: ReactionType): Promise<ReactionSummary> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const existing = await this.prisma.reaction.findUnique({
      where: {
        articleId_userId_type: {
          articleId: article.id,
          userId,
          type,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.reaction.create({
        data: { articleId: article.id, userId, type },
      });
    }

    return this.summary(slug, userId);
  }
}
