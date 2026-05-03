import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";

import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForSlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, nickname: true } } },
    });

    return comments.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.user.nickname,
      userId: c.userId,
      createdAt: c.createdAt,
    }));
  }

  async create(slug: string, userId: string, dto: CreateCommentDto) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const created = await this.prisma.comment.create({
      data: {
        articleId: article.id,
        userId,
        body: dto.body,
      },
      include: { user: { select: { id: true, nickname: true } } },
    });

    return {
      id: created.id,
      body: created.body,
      author: created.user.nickname,
      userId: created.userId,
      createdAt: created.createdAt,
    };
  }

  async remove(commentId: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
  }
}
