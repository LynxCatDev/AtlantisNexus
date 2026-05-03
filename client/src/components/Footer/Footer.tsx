import Link from "next/link";

import {
  GitHubIcon,
  RssIcon,
  TwitterIcon,
  YouTubeIcon,
} from "@/components/Icons/Icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { footerLinkGroups, socialLinks } from "@/constants/navigation";

import { BrandLogo } from "../BrandLogo/BrandLogo";

function SocialIcon({ label }: { label: string }) {
  if (label === "GitHub") {
    return <GitHubIcon />;
  }

  if (label === "YouTube") {
    return <YouTubeIcon />;
  }

  if (label === "RSS") {
    return <RssIcon />;
  }

  return <TwitterIcon />;
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <BrandLogo />
          <p>
            A premium media hub for gamers, developers, and tech-curious minds. News, deep
            guides, and useful tools in one place.
          </p>
          <div className="social-links" aria-label="Social links">
            {socialLinks.map((link) => (
              <a href={link.href} aria-label={link.label} key={link.label}>
                <SocialIcon label={link.label} />
              </a>
            ))}
          </div>
          <div className="footer-language">
            <LanguageSwitcher />
          </div>
        </div>
        {footerLinkGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <Link href={link.href} key={link.label}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 Atlantis Nexus. Built for the curious.</span>
        <span>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <Link href="/admin">Admin</Link>
        </span>
      </div>
    </footer>
  );
}
