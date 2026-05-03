import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/CategoryPage/CategoryPage";
import { articleCategorySlugs, articles, getArticleCategoryBySlug } from "@/constants/articles";

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

  return (
    <CategoryPage
      articles={articles.filter((article) => article.category === category)}
      category={category}
    />
  );
}
