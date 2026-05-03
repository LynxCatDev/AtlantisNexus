import { TagPage } from "@/components/TagPage/TagPage";
import { articles } from "@/constants/articles";

type TagRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return Array.from(new Set(articles.flatMap((article) => article.tags))).map((slug) => ({
    slug,
  }));
}

export default async function TagRoute({ params }: TagRouteProps) {
  const { slug } = await params;
  const tag = slug.toLowerCase();

  return (
    <TagPage
      articles={articles.filter((article) => article.tags.includes(tag))}
      tag={tag}
    />
  );
}
