import { getLocale } from "next-intl/server";

import { SearchPage } from "@/components/SearchPage/SearchPage";
import { fetchArticles, toFrontendArticle } from "@/lib/articles";
import type { Article } from "@/types/content";

export default async function SearchRoute() {
  const locale = await getLocale();
  const apiArticles = await fetchArticles(locale);
  const articles = apiArticles
    .map((article) => toFrontendArticle(article))
    .filter((article): article is Article => article !== null);

  return <SearchPage articles={articles} />;
}
