import { getLocale } from "next-intl/server";

import { HomePage } from "@/components/HomePage/HomePage";
import { fetchArticles, toFrontendArticle } from "@/lib/articles";
import type { Article } from "@/types/content";

export default async function Home() {
  const locale = await getLocale();
  const apiArticles = await fetchArticles(locale);
  const backendArticles = apiArticles
    .map((article) => toFrontendArticle(article))
    .filter((a): a is Article => a !== null);

  return <HomePage articles={backendArticles} />;
}
