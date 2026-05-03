import { notFound } from "next/navigation";

import { ToolDetailPage } from "@/components/ToolDetailPage/ToolDetailPage";
import { getToolBySlug, toolCatalog } from "@/constants/tools";

type ToolRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return toolCatalog.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolRoute({ params }: ToolRouteProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  return <ToolDetailPage tool={tool} />;
}
