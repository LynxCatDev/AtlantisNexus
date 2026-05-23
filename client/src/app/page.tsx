import { getLocale } from "next-intl/server";

import { HomePage } from "@/components/HomePage/HomePage";
import { articles as mockArticles } from "@/constants/articles";
import { fetchArticles, toFrontendArticle } from "@/lib/articles";
import type { Article } from "@/types/content";

export default async function Home() {
  const locale = await getLocale();
  const apiArticles = await fetchArticles(locale);
  const backendArticles = apiArticles
    .map((article) => toFrontendArticle(article))
    .filter((a): a is Article => a !== null);

  const seen = new Set(backendArticles.map((a) => a.slug));
  const articles: Article[] = [
    ...backendArticles,
    ...mockArticles.filter((a) => !seen.has(a.slug)),
  ];

  return <HomePage articles={articles} />;
}
