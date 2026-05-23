import { getLocale } from "next-intl/server";

import { ArticlesPage } from "@/components/ArticlesPage/ArticlesPage";
import { articles as mockArticles } from "@/constants/articles";
import { fetchArticles, toFrontendArticle } from "@/lib/articles";
import type { Article } from "@/types/content";

export default async function ArticlesRoute() {
  const locale = await getLocale();
  const apiArticles = await fetchArticles(locale);
  const backendArticles = apiArticles
    .map((article) => toFrontendArticle(article))
    .filter((article): article is Article => article !== null);

  const seen = new Set(backendArticles.map((article) => article.slug));
  const articles: Article[] = [
    ...backendArticles,
    ...mockArticles.filter((article) => !seen.has(article.slug)),
  ];

  return <ArticlesPage articles={articles} />;
}
