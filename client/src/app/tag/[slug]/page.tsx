import { getLocale } from "next-intl/server";

import { TagPage } from "@/components/TagPage/TagPage";
import { fetchArticles, toFrontendArticle } from "@/lib/articles";
import type { Article } from "@/types/content";

type TagRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TagRoute({ params }: TagRouteProps) {
  const { slug } = await params;
  const tag = slug.toLowerCase();
  const locale = await getLocale();
  const apiArticles = await fetchArticles(locale);
  const articles = apiArticles
    .map((article) => toFrontendArticle(article))
    .filter((article): article is Article => article !== null);

  return (
    <TagPage
      articles={articles.filter((article) => article.tags.includes(tag))}
      tag={tag}
    />
  );
}
