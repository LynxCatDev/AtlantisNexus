import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { CategoryPage } from "@/components/CategoryPage/CategoryPage";
import { articleCategorySlugs, articles as mockArticles, getArticleCategoryBySlug } from "@/constants/articles";
import { fetchArticles, toFrontendArticle } from "@/lib/articles";
import type { Article } from "@/types/content";

type CategoryRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return Object.values(articleCategorySlugs).map((slug) => ({ slug }));
}

export default async function CategoryRoute({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const category = getArticleCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

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

  return (
    <CategoryPage
      articles={articles.filter((article) => article.category === category)}
      category={category}
    />
  );
}
