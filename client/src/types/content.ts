export type ArticleCategory = "Gaming" | "AI" | "Dev";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  minutes: string;
  image: string;
  tags: string[];
};

export type ArticleSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  quote?: string;
};

export type ArticleComment = {
  author: string;
  initials: string;
  postedAt: string;
  body: string;
};

export type ArticleDetail = {
  article: Article;
  tags: string[];
  reactions: {
    likes: string;
    comments: string;
  };
  sections: ArticleSection[];
  comments: ArticleComment[];
  related: Article[];
};

export type Metric = {
  label: string;
  value: string;
};

export type NavItem = {
  label: string;
  labelKey?: string;
  href: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  accent: ArticleCategory;
};

export type ToolCard = {
  slug: string;
  title: string;
  description: string;
  type: string;
  metric: string;
};

export type ToolCategory = "Calculators" | "Media" | "Developer" | "AI";

export type ToolIconName =
  | "braces"
  | "calculator"
  | "convert"
  | "file"
  | "hash"
  | "image"
  | "palette"
  | "regex";

export type ToolCatalogItem = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  metric: string;
  icon: ToolIconName;
};

export type FooterLinkGroup = {
  title: string;
  links: NavItem[];
};

export type SocialLink = {
  label: string;
  href: string;
  shortLabel: string;
};
