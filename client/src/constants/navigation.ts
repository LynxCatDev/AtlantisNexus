import type { FooterLinkGroup, NavItem, SocialLink } from "@/types/content";

export const mainNavigation: NavItem[] = [
  { label: "Articles", labelKey: "articles", href: "/articles" },
  { label: "Gaming", labelKey: "gaming", href: "/category/gaming" },
  { label: "AI", labelKey: "ai", href: "/category/ai" },
  { label: "Dev", labelKey: "dev", href: "/category/dev" },
  { label: "Tools", labelKey: "tools", href: "/tools" },
  { label: "About", labelKey: "about", href: "/about" },
];

export type FooterLinkKeyedGroup = {
  titleKey: "groupContent" | "groupTools" | "groupCompany";
  links: Array<NavItem & { footerKey?: string }>;
};

export const footerLinkGroups: FooterLinkKeyedGroup[] = [
  {
    titleKey: "groupContent",
    links: [
      { label: "Articles", footerKey: "articles", href: "/articles" },
      { label: "Gaming", footerKey: "gaming", href: "/category/gaming" },
      { label: "AI", footerKey: "ai", href: "/category/ai" },
      { label: "Dev", footerKey: "dev", href: "/category/dev" },
    ],
  },
  {
    titleKey: "groupTools",
    links: [
      { label: "All Tools", footerKey: "linkAllTools", href: "/tools" },
      { label: "Calculators", footerKey: "linkCalculators", href: "/tools#percentage-calculator" },
      { label: "Developer", footerKey: "linkDeveloper", href: "/tools#json-formatter" },
      { label: "Media", footerKey: "linkMedia", href: "/tools#image-compressor" },
    ],
  },
  {
    titleKey: "groupCompany",
    links: [
      { label: "About", footerKey: "about", href: "/about" },
      { label: "Newsletter", footerKey: "linkNewsletter", href: "/about" },
      { label: "Contact", footerKey: "linkContact", href: "/about" },
      { label: "Careers", footerKey: "linkCareers", href: "/about" },
    ],
  },
];

// Legacy export retained for compatibility
export const footerLinkGroupsLegacy: FooterLinkGroup[] = footerLinkGroups.map((g) => ({
  title: g.titleKey,
  links: g.links,
}));

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "#", shortLabel: "GH" },
  { label: "X", href: "#", shortLabel: "X" },
  { label: "YouTube", href: "#", shortLabel: "YT" },
  { label: "RSS", href: "#", shortLabel: "RSS" },
];
