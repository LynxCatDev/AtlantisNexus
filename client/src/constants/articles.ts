import type { Article, ArticleCategory, ArticleDetail } from "@/types/content";

export const articleCategories: Array<ArticleCategory | "All"> = ["All", "Gaming", "AI", "Dev"];

export const articleCategorySlugs: Record<ArticleCategory, string> = {
  Gaming: "gaming",
  AI: "ai",
  Dev: "dev",
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

export const articles: Article[] = [
  {
    slug: "elden-ring-nightreign-co-op-souls-era",
    title: "Elden Ring Nightreign — A Deep Dive Into the New Co-Op Souls Era",
    excerpt:
      "FromSoftware reshapes its formula. Here's everything we learned playing 30 hours of the new co-op spinoff.",
    category: "Gaming",
    author: "Mira Voss",
    publishedAt: "Apr 24, 2026",
    minutes: "9m",
    image: "/images/cover-gaming.jpg",
    tags: ["elden", "fromsoftware", "reviews", "gaming"],
  },
  {
    slug: "shipping-ai-agents-to-production",
    title: "Shipping AI Agents to Production Without Losing Your Mind",
    excerpt:
      "Battle-tested patterns for tool-use, memory, evaluation, and rollout from teams running agents at scale.",
    category: "AI",
    author: "Kenji Park",
    publishedAt: "Apr 22, 2026",
    minutes: "12m",
    image: "/images/cover-ai.jpg",
    tags: ["ai", "agents", "production", "tools"],
  },
  {
    slug: "react-19-server-actions-patterns",
    title: "React 19 Server Actions: Patterns That Actually Scale",
    excerpt:
      "Beyond hello-world demos: real architecture for forms, mutations, and progressive enhancement.",
    category: "Dev",
    author: "Lena Cole",
    publishedAt: "Apr 20, 2026",
    minutes: "8m",
    image: "/images/cover-dev.jpg",
    tags: ["react", "server-actions", "architecture", "dev"],
  },
  {
    slug: "rpgs-defining-2026",
    title: "The 12 RPGs Defining 2026 So Far",
    excerpt:
      "From indie darlings to AAA juggernauts, the role-playing landscape has never been richer.",
    category: "Gaming",
    author: "Mira Voss",
    publishedAt: "Apr 18, 2026",
    minutes: "7m",
    image: "/images/cover-gaming.jpg",
    tags: ["rpg", "gaming", "2026", "indie"],
  },
  {
    slug: "rag-is-dead-long-live-rag",
    title: "RAG Is Dead. Long Live RAG.",
    excerpt: "Why retrieval still matters in the era of million-token context windows.",
    category: "AI",
    author: "Kenji Park",
    publishedAt: "Apr 16, 2026",
    minutes: "10m",
    image: "/images/cover-ai.jpg",
    tags: ["rag", "ai", "retrieval", "llm"],
  },
  {
    slug: "edge-runtime-tradeoffs-2026",
    title: "The Real Tradeoffs of Edge Runtimes in 2026",
    excerpt: "Cold starts, cost, locality: a sober look at when the edge actually wins.",
    category: "Dev",
    author: "Lena Cole",
    publishedAt: "Apr 14, 2026",
    minutes: "11m",
    image: "/images/cover-dev.jpg",
    tags: ["edge-runtimes", "dev", "performance", "react"],
  },
];

const canonicalArticleDetails: Record<string, ArticleDetail> = Object.fromEntries(
  articles.map((article) => [article.slug, buildArticleDetail(article)]),
) as Record<string, ArticleDetail>;

const articleSlugAliases: Record<string, string> = {
  "best-rpgs-2026": "rpgs-defining-2026",
  "elden-ring-nightreign-deep-dive": "elden-ring-nightreign-co-op-souls-era",
  "shipping-ai-agents-production": "shipping-ai-agents-to-production",
};

export const articleDetails: Record<string, ArticleDetail> = { ...canonicalArticleDetails };

for (const [alias, slug] of Object.entries(articleSlugAliases)) {
  const detail = canonicalArticleDetails[slug];

  if (detail) {
    articleDetails[alias] = detail;
  }
}

export function getArticleDetail(slug: string): ArticleDetail | undefined {
  return articleDetails[slug];
}

function buildArticleDetail(article: Article): ArticleDetail {
  if (article.slug === "elden-ring-nightreign-co-op-souls-era") {
    return {
      article,
      tags: article.tags,
      reactions: {
        likes: "1.2K",
        comments: "84",
      },
      sections: [
        {
          id: "introduction",
          title: "Introduction",
          paragraphs: [
            "The reveal felt inevitable, and yet it landed with the same gut-punch every FromSoftware reveal does. Nightreign is not just an Elden Ring expansion. It is a re-imagining of the formula, refracted through co-op, run-based progression, and a tighter loop than the studio has ever shipped.",
          ],
        },
        {
          id: "key-takeaways",
          title: "Key takeaways",
          bullets: [
            "Three-player runs replace the open-world wander.",
            "Procedural Limveld biomes keep encounters fresh.",
            "Boss roster pulls from across Souls history.",
          ],
        },
        {
          id: "deep-dive",
          title: "The deep dive",
          paragraphs: [
            "After thirty hours in the press preview build, the moment-to-moment combat retains the deliberate, weighty rhythm of Elden Ring while the run structure injects the kind of variance that Hades fans will find familiar. Each night cycle escalates pressure in a way that quietly teaches you to trust your party.",
            "Class identity is the other big swing. Each of the eight Nightfarers feels distinct enough to demand actual coordination, not the loose three-player chaos we have seen in older co-op experiments.",
          ],
          quote: "We did not want a new world. We wanted players to see the old one with new eyes.",
        },
        {
          id: "verdict",
          title: "Verdict",
          paragraphs: [
            "Nightreign is a confident, surprising left turn. If FromSoftware can keep the meta-progression honest and the netcode clean at launch, this becomes one of 2026's defining co-op experiences.",
          ],
        },
      ],
      comments: [
        {
          author: "Ren K.",
          initials: "RK",
          postedAt: "2h ago",
          body: "Best Souls take I've read in months. The point about coordination is dead-on.",
        },
        {
          author: "Aria T.",
          initials: "AT",
          postedAt: "5h ago",
          body: "Genuinely excited now. Was skeptical the co-op pivot would water down the tension.",
        },
      ],
      related: [articles[3]],
    };
  }

  return {
    article,
    tags: article.tags,
    reactions: {
      likes: "840",
      comments: "31",
    },
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        paragraphs: [
          `${article.title} sits right at the center of what Atlantis Nexus tracks: practical shifts, clear analysis, and enough context to make the next decision easier.`,
        ],
      },
      {
        id: "key-takeaways",
        title: "Key takeaways",
        bullets: [
          "The topic is moving faster than casual coverage suggests.",
          "The strongest ideas are already showing up in production work.",
          "The useful pattern is less hype, more repeatable process.",
        ],
      },
      {
        id: "deep-dive",
        title: "The deep dive",
        paragraphs: [
          article.excerpt,
          "The interesting part is not the headline itself, but the way teams and players adapt once the first wave of excitement fades. That is where durable habits, better tooling, and stronger taste start to matter.",
        ],
        quote: "Useful coverage should make the signal easier to act on.",
      },
      {
        id: "verdict",
        title: "Verdict",
        paragraphs: [
          "This is worth watching closely, especially as the first real users push past launch-day assumptions.",
        ],
      },
    ],
    comments: [
      {
        author: "Ren K.",
        initials: "RK",
        postedAt: "2h ago",
        body: "This is the kind of context I wanted, not just another quick headline.",
      },
      {
        author: "Aria T.",
        initials: "AT",
        postedAt: "5h ago",
        body: "The practical angle here is what makes it useful.",
      },
    ],
    related: articles.filter((candidate) => candidate.slug !== article.slug).slice(0, 1),
  };
}
