import { notFound } from "next/navigation";

import { ArticleDetailPage } from "@/components/ArticleDetailPage/ArticleDetailPage";
import { articleDetails, getArticleDetail } from "@/constants/articles";

type ArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(articleDetails).map((slug) => ({ slug }));
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const detail = getArticleDetail(slug);

  if (!detail) {
    notFound();
  }

  return <ArticleDetailPage detail={detail} />;
}
