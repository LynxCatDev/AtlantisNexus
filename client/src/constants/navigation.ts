import type { FooterLinkGroup, NavItem, SocialLink } from "@/types/content";

export const mainNavigation: NavItem[] = [
  { label: "Articles", href: "/articles" },
  { label: "Gaming", href: "/category/gaming" },
  { label: "AI", href: "/category/ai" },
  { label: "Dev", href: "/category/dev" },
  { label: "Tools", href: "/tools" },
  { label: "About", href: "/about" },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Content",
    links: [
      { label: "Articles", href: "/articles" },
      { label: "Gaming", href: "/category/gaming" },
      { label: "AI", href: "/category/ai" },
      { label: "Dev", href: "/category/dev" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "All Tools", href: "/tools" },
      { label: "Calculators", href: "/tools#percentage-calculator" },
      { label: "Developer", href: "/tools#json-formatter" },
      { label: "Media", href: "/tools#image-compressor" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Newsletter", href: "/about" },
      { label: "Contact", href: "/about" },
      { label: "Careers", href: "/about" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "#", shortLabel: "GH" },
  { label: "X", href: "#", shortLabel: "X" },
  { label: "YouTube", href: "#", shortLabel: "YT" },
  { label: "RSS", href: "#", shortLabel: "RSS" },
];
