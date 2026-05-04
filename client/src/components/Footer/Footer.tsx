"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/Auth/AuthProvider";
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
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");

  const resolveLinkLabel = (key: string | undefined, fallback: string): string => {
    if (!key) return fallback;
    if (["articles", "gaming", "ai", "dev", "tools", "about"].includes(key)) {
      return tNav(key as Parameters<typeof tNav>[0]);
    }
    return tFooter(key as Parameters<typeof tFooter>[0]);
  };

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <BrandLogo />
          <p>{tFooter("tagline")}</p>
          <div className="footer__social" aria-label={tFooter("socialAriaLabel")}>
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
          <div key={group.titleKey}>
            <h3>{tFooter(group.titleKey)}</h3>
            {group.links.map((link) => (
              <Link href={link.href} key={link.label}>
                {resolveLinkLabel(link.footerKey, link.label)}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer__bottom">
        <span>{tFooter("copyright")}</span>
        <span>
          <a href="#">{tFooter("privacy")}</a>
          <a href="#">{tFooter("terms")}</a>
          {isAdmin ? <Link href="/admin">{tFooter("admin")}</Link> : null}
        </span>
      </div>
    </footer>
  );
}
