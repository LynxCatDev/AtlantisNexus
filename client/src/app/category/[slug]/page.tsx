import { notFound } from "next/navigation";

import { ArticlesPage } from "@/components/ArticlesPage/ArticlesPage";
import { articleCategorySlugs, getArticleCategoryBySlug } from "@/constants/articles";

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

  return <ArticlesPage activeCategory={category} />;
}
