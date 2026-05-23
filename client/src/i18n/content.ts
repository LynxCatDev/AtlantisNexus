import { useTranslations } from "next-intl";

type AnyT = ((key: string) => string) & { has: (key: string) => boolean };

export function useToolContent() {
  const t = useTranslations("content.tools") as unknown as AnyT;
  return {
    title: (slug: string, fallback: string) => safe(t, `${slug}.title`, fallback),
    description: (slug: string, fallback: string) =>
      safe(t, `${slug}.description`, fallback),
  };
}

function safe(t: AnyT, key: string, fallback: string): string {
  return t.has(key) ? t(key) : fallback;
}
