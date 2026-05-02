export type ArticleCategory = "Gaming" | "AI" | "Dev";

export type Article = {
  title: string;
  excerpt: string;
  category: ArticleCategory;
  author: string;
  minutes: string;
  image: string;
};

export type Metric = {
  label: string;
  value: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  accent: ArticleCategory;
};

export type ToolCard = {
  title: string;
  description: string;
  type: string;
  metric: string;
};

export type LanguageOption = {
  code: string;
  label: string;
  short: string;
  active: boolean;
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
