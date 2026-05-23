import type { Metric, ToolCard } from "@/types/content";

export const heroMetrics: Metric[] = [
  { value: "430+", label: "Articles" },
  { value: "24", label: "Free tools" },
  { value: "180K", label: "Monthly readers" },
];

export const freeTools: ToolCard[] = [
  {
    slug: "image-compressor",
    title: "Image Compressor",
    description: "Shrink JPG, PNG and WEBP without visible quality loss.",
    type: "Media",
    metric: "280K uses",
  },
  {
    slug: "color-converter",
    title: "Color Converter",
    description: "Convert between HEX, RGB, HSL, OKLCH instantly.",
    type: "Developer",
    metric: "295K uses",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Quick percentage, increase, decrease and ratio math.",
    type: "Calculators",
    metric: "426K uses",
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Beautify, validate and minify JSON in one click.",
    type: "Developer",
    metric: "356K uses",
  },
];

export const trendingTopics = [
  "React 19",
  "Elden Ring",
  "LLM Agents",
  "Toolbench",
  "Media Careers",
  "Prompt Engineering",
  "Edge Runtimes",
  "Indie Dev",
  "RAG",
  "TypeScript",
  "Steam Deck",
  "Cursor",
  "Nintendo",
];
