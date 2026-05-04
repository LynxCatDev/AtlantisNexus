import { useTranslations } from "next-intl";

type AnyT = (key: string) => string;

export function useArticleContent() {
  const t = useTranslations("content.articles") as unknown as AnyT;
  return {
    title: (slug: string, fallback: string) => safe(t, `${slug}.title`, fallback),
    excerpt: (slug: string, fallback: string) => safe(t, `${slug}.excerpt`, fallback),
  };
}

export function useToolContent() {
  const t = useTranslations("content.tools") as unknown as AnyT;
  return {
    title: (slug: string, fallback: string) => safe(t, `${slug}.title`, fallback),
    description: (slug: string, fallback: string) =>
      safe(t, `${slug}.description`, fallback),
  };
}

function safe(t: AnyT, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}
