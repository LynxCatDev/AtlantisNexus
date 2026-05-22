import { getLocale } from "next-intl/server";

import { HomePage } from "@/components/HomePage/HomePage";
import { articles as mockArticles } from "@/constants/articles";
import { fetchArticles, formatPublishedDate, type ApiArticleSummary } from "@/lib/articles";
import type { Article, ArticleCategory } from "@/types/content";

const SLUG_TO_CATEGORY: Record<string, ArticleCategory> = {
  gaming: "Gaming",
  ai: "AI",
  dev: "Dev",
  movies: "Movies",
  tech: "Tech",
};

function toFrontendArticle(api: ApiArticleSummary): Article | null {
  const category = SLUG_TO_CATEGORY[api.category.slug];
  if (!category) return null;
  return {
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
}

export default async function Home() {
  const locale = await getLocale();
  const apiArticles = await fetchArticles(locale);
  const backendArticles = apiArticles
    .map(toFrontendArticle)
    .filter((a): a is Article => a !== null);

  const seen = new Set(backendArticles.map((a) => a.slug));
  const articles: Article[] = [
    ...backendArticles,
    ...mockArticles.filter((a) => !seen.has(a.slug)),
  ];

  return <HomePage articles={articles} />;
}
