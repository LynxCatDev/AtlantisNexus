import { apiBaseUrl } from "@/lib/api";

export type ApiCategory = {
  slug: string;
  label: string;
  isMain: boolean;
};

export type ApiArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ApiCategory;
  author: string;
  authorId: string;
  publishedAt: string;
  minutes: string;
  image: string;
  tags: string[];
  locale: string | null;
  availableLocales: string[];
  counts: { comments: number; reactions: number };
};

export type ApiArticleDetail = ApiArticleSummary & {
  sections: {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    quote?: string;
  }[];
  reactions: {
    counts: Record<string, number>;
    total: number;
  };
  comments: {
    id: string;
    body: string;
    author: string;
    userId: string;
    createdAt: string;
  }[];
};

const SERVER_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  apiBaseUrl;

export async function fetchArticles(locale: string = "en"): Promise<ApiArticleSummary[]> {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/articles?locale=${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as ApiArticleSummary[];
  } catch {
    return [];
  }
}

export async function fetchArticleBySlug(
  slug: string,
  locale: string = "en",
): Promise<ApiArticleDetail | null> {
  try {
    const res = await fetch(
      `${SERVER_BASE_URL}/articles/${encodeURIComponent(slug)}?locale=${locale}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as ApiArticleDetail;
  } catch {
    return null;
  }
}

export function formatPublishedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
