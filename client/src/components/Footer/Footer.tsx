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
import "./Footer.scss";

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
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <BrandLogo />
          <p>
            A premium media hub for gamers, developers, and tech-curious minds. News, deep
            guides, and useful tools in one place.
          </p>
          <div className="footer__social" aria-label="Social links">
            {socialLinks.map((link) => (
              <a href={link.href} aria-label={link.label} key={link.label}>
                <SocialIcon label={link.label} />
              </a>
            ))}
          </div>
          <div className="footer__language">
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
      <div className="footer__bottom">
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
