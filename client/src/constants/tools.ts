import type { ToolCatalogItem, ToolCategory } from "@/types/content";

export const toolCategories: Array<ToolCategory | "All"> = [
  "All",
  "Calculators",
  "Media",
  "Developer",
  "AI",
];

export const toolCatalog: ToolCatalogItem[] = [
  {
    slug: "image-compressor",
    title: "Image Compressor",
    description: "Shrink JPG, PNG, and WebP without visible quality loss.",
    category: "Media",
    metric: "284K uses",
    icon: "image",
  },
  {
    slug: "color-converter",
    title: "Color Converter",
    description: "Convert between HEX, RGB, HSL, OKLCH instantly.",
    category: "Developer",
    metric: "192K uses",
    icon: "palette",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Quick percentage, increase, decrease and ratio math.",
    category: "Calculators",
    metric: "410K uses",
    icon: "calculator",
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Beautify, validate and minify JSON in one click.",
    category: "Developer",
    metric: "356K uses",
    icon: "braces",
  },
  {
    slug: "ai-token-counter",
    title: "AI Token Counter",
    description: "Count tokens for GPT, Claude, Gemini before you send.",
    category: "AI",
    metric: "128K uses",
    icon: "hash",
  },
  {
    slug: "markdown-preview",
    title: "Markdown Preview",
    description: "Live preview your README with GitHub-flavored MD.",
    category: "Developer",
    metric: "97K uses",
    icon: "file",
  },
  {
    slug: "image-converter",
    title: "Image Converter",
    description: "Convert PNG, JPG, WebP, AVIF - no upload required.",
    category: "Media",
    metric: "176K uses",
    icon: "convert",
  },
  {
    slug: "regex-tester",
    title: "Regex Tester",
    description: "Test, explain and debug regular expressions.",
    category: "Developer",
    metric: "143K uses",
    icon: "regex",
  },
];

export function getToolBySlug(slug: string): ToolCatalogItem | undefined {
  return toolCatalog.find((tool) => tool.slug === slug);
}
