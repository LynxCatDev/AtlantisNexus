import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { ArticleDetailPage } from "@/components/ArticleDetailPage/ArticleDetailPage";
import { fetchArticleBySlug, fetchArticles, formatPublishedDate, toFrontendArticle, type ApiArticleDetail } from "@/lib/articles";
import type { Article, ArticleDetail } from "@/types/content";

type ArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const apiDetail = await fetchArticleBySlug(slug, locale);
  if (!apiDetail) {
    notFound();
  }

  const detail = await toArticleDetail(apiDetail, locale);
  return <ArticleDetailPage detail={detail} />;
}

async function toArticleDetail(api: ApiArticleDetail, locale: string): Promise<ArticleDetail> {
  const article = toFrontendArticle(api, "Dev");
  if (!article) {
    throw new Error("Unable to map article");
  }

  const related = await fetchRelated(api.slug, locale);

  return {
    article,
    tags: api.tags,
    reactions: {
      likes: String(api.reactions.total ?? 0),
      comments: String(api.comments.length ?? 0),
    },
    sections: api.sections.map((section, idx) => ({
      id: section.id || `section-${idx + 1}`,
      title: section.title,
      paragraphs: section.paragraphs,
      bullets: section.bullets,
      quote: section.quote,
    })),
    comments: api.comments.map((comment) => ({
      author: comment.author,
      initials: comment.author.slice(0, 2).toUpperCase(),
      postedAt: formatPublishedDate(comment.createdAt),
      body: comment.body,
    })),
    related,
  };
}

async function fetchRelated(currentSlug: string, locale: string): Promise<Article[]> {
  const apiArticles = await fetchArticles(locale);
  const others: Article[] = [];
  for (const a of apiArticles) {
    if (a.slug === currentSlug) continue;
    const article = toFrontendArticle(a);
    if (!article) continue;
    others.push(article);
    if (others.length >= 3) break;
  }
  return others;
}
