import { footerLinkGroups, socialLinks } from "@/constants/navigation";

import { BrandLogo } from "../BrandLogo/BrandLogo";

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
                {link.shortLabel}
              </a>
            ))}
          </div>
        </div>
        {footerLinkGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 Atlantis Nexus. Built for the curious.</span>
        <span>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Admin</a>
        </span>
      </div>
    </footer>
  );
}
