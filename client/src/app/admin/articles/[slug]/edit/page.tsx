import { ArticleCreatePage } from "@/components/Admin/ArticleCreatePage";

type EditArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditArticlePage({ params }: EditArticleRouteProps) {
  const { slug } = await params;
  return <ArticleCreatePage editSlug={slug} />;
}
