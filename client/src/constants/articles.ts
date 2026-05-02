import type { Article, ArticleCategory } from "@/types/content";

export const articleCategories: Array<ArticleCategory | "All"> = ["All", "Gaming", "AI", "Dev"];

export const articles: Article[] = [
  {
    title: "Elden Ring Nightreign - A Deep Dive Into the New Co-Op Souls Era",
    excerpt:
      "FromSoftware reshapes its formula. Here's everything we learned playing 30 hours of the new co-op spinoff.",
    category: "Gaming",
    author: "Mira Voss",
    minutes: "9m",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Shipping AI Agents to Production Without Losing Your Mind",
    excerpt:
      "Battle-tested patterns for tool-use, memory, evaluation, and rollout from teams running agents at scale.",
    category: "AI",
    author: "Kenji Park",
    minutes: "12m",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "React 19 Server Actions: Patterns That Actually Scale",
    excerpt:
      "Beyond hello-world demos: real architecture for forms, mutations, and progressive enhancement.",
    category: "Dev",
    author: "Lena Cole",
    minutes: "8m",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "The 12 RPGs Defining 2026 So Far",
    excerpt:
      "From indie darlings to AAA juggernauts, the role-playing landscape has never been richer.",
    category: "Gaming",
    author: "Mira Voss",
    minutes: "7m",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "RAG Is Dead. Long Live RAG.",
    excerpt: "Why retrieval still matters in the era of million-token context windows.",
    category: "AI",
    author: "Kenji Park",
    minutes: "10m",
    image:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "The Real Tradeoffs of Edge Runtimes in 2026",
    excerpt: "Cold starts, cost, locality: a sober look at when the edge actually wins.",
    category: "Dev",
    author: "Lena Cole",
    minutes: "11m",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
  },
];
