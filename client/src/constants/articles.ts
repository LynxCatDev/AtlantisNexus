import type { ArticleCategory } from "@/types/content";

export const articleCategories: Array<ArticleCategory | "All"> = [
  "All",
  "Gaming",
  "AI",
  "Dev",
  "Movies",
  "Tech",
];

export const articleCategorySlugs: Record<ArticleCategory, string> = {
  Gaming: "gaming",
  AI: "ai",
  Dev: "dev",
  Movies: "movies",
  Tech: "tech",
};

export function getArticleCategoryBySlug(slug: string): ArticleCategory | undefined {
  const match = (Object.entries(articleCategorySlugs) as Array<[ArticleCategory, string]>).find(
    ([, categorySlug]) => categorySlug === slug,
  );

  return match?.[0];
}

export function getArticleCategoryHref(category: ArticleCategory | "All"): string {
  return category === "All" ? "/articles" : `/category/${articleCategorySlugs[category]}`;
}
