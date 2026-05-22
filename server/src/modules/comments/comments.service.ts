import { Injectable, NotFoundException } from "@nestjs/common";
import { Locale, Prisma } from "@prisma/client";

import { PrismaService } from "../../database/prisma.service";

import { CreateCommentDto } from "./dto/create-comment.dto";
import { ListCommentsQueryDto } from "./dto/list-comments-query.dto";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(query: ListCommentsQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const skip = (page - 1) * pageSize;
    const search = query.q?.trim();

    const where: Prisma.CommentWhereInput = search
      ? {
          OR: [
            { body: { contains: search, mode: "insensitive" } },
            { article: { slug: { contains: search, mode: "insensitive" } } },
            { user: { nickname: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [total, comments] = await this.prisma.$transaction([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, nickname: true, avatar: true, role: true } },
          article: {
            select: {
              slug: true,
              translations: {
                where: { locale: Locale.en },
                select: { title: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      items: comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        author: c.user.nickname,
        avatar: c.user.avatar,
        role: c.user.role,
        userId: c.userId,
        articleSlug: c.article.slug,
        articleTitle: c.article.translations[0]?.title ?? c.article.slug,
      })),
    };
  }

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
      include: { user: { select: { id: true, nickname: true, avatar: true, role: true } } },
    });

    return comments.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.user.nickname,
      avatar: c.user.avatar,
      role: c.user.role,
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
      include: { user: { select: { id: true, nickname: true, avatar: true, role: true } } },
    });

    return {
      id: created.id,
      body: created.body,
      author: created.user.nickname,
      avatar: created.user.avatar,
      role: created.user.role,
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
