import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { ArticleDetailPage } from "@/components/ArticleDetailPage/ArticleDetailPage";
import { articleDetails, articles as mockArticles, getArticleDetail } from "@/constants/articles";
import { fetchArticleBySlug, fetchArticles, formatPublishedDate, type ApiArticleDetail } from "@/lib/articles";
import type { Article, ArticleCategory, ArticleDetail } from "@/types/content";

type ArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const SLUG_TO_CATEGORY: Record<string, ArticleCategory> = {
  gaming: "Gaming",
  ai: "AI",
  dev: "Dev",
  movies: "Movies",
  tech: "Tech",
};

export function generateStaticParams() {
  return Object.keys(articleDetails).map((slug) => ({ slug }));
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const mockDetail = getArticleDetail(slug);
  if (mockDetail) {
    return <ArticleDetailPage detail={mockDetail} />;
  }

  const locale = await getLocale();
  const apiDetail = await fetchArticleBySlug(slug, locale);
  if (!apiDetail) {
    notFound();
  }

  const detail = await toArticleDetail(apiDetail, locale);
  return <ArticleDetailPage detail={detail} />;
}

async function toArticleDetail(api: ApiArticleDetail, locale: string): Promise<ArticleDetail> {
  const category = SLUG_TO_CATEGORY[api.category.slug] ?? "Dev";
  const article: Article = {
    slug: api.slug,
    title: api.title,
    excerpt: api.excerpt,
    category,
    author: api.author,
    publishedAt: formatPublishedDate(api.publishedAt),
    minutes: api.minutes,
    image: api.image,
    tags: api.tags,
  };

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
    const category = SLUG_TO_CATEGORY[a.category.slug];
    if (!category) continue;
    others.push({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category,
      author: a.author,
      publishedAt: formatPublishedDate(a.publishedAt),
      minutes: a.minutes,
      image: a.image,
      tags: a.tags,
    });
    if (others.length >= 3) break;
  }
  if (others.length === 0) {
    return mockArticles.filter((m) => m.slug !== currentSlug).slice(0, 1);
  }
  return others;
}
