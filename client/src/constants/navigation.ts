import type { FooterLinkGroup, NavItem, SocialLink } from "@/types/content";

export const mainNavigation: NavItem[] = [
  { label: "Articles", href: "/articles" },
  { label: "Gaming", href: "/articles#gaming" },
  { label: "AI", href: "/articles#ai" },
  { label: "Dev", href: "/articles#dev" },
  { label: "Tools", href: "/#tools" },
  { label: "About", href: "/#about" },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Content",
    links: [
      { label: "Articles", href: "#articles" },
      { label: "Gaming", href: "/articles#gaming" },
      { label: "AI", href: "/articles#ai" },
      { label: "Dev", href: "/articles#dev" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "All Tools", href: "/#tools" },
      { label: "Calculators", href: "/#tools" },
      { label: "Developer", href: "/articles#dev" },
      { label: "Media", href: "/articles" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Newsletter", href: "#newsletter" },
      { label: "Contact", href: "#contact" },
      { label: "Careers", href: "#careers" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "#", shortLabel: "GH" },
  { label: "X", href: "#", shortLabel: "X" },
  { label: "YouTube", href: "#", shortLabel: "YT" },
  { label: "RSS", href: "#", shortLabel: "RSS" },
];
