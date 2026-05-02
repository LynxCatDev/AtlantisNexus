import Link from "next/link";

import { mainNavigation } from "@/constants/navigation";

import { BrandLogo } from "../BrandLogo/BrandLogo";
import { SearchIcon } from "../Icons/Icons";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";

type HeaderProps = {
  activeLabel?: string;
};

export function Header({ activeLabel }: HeaderProps) {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <BrandLogo />
        <div className="nav-links" aria-label="Sections">
          {mainNavigation.map((item) => (
            <Link
              className={item.label === activeLabel ? "nav-link active" : "nav-link"}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <label className="search-box">
          <SearchIcon />
          <input type="search" placeholder="Search articles, tools..." />
          <kbd>Ctrl K</kbd>
        </label>
        <LanguageSwitcher />
        <Link className="signin-link" href="/signup">
          Sign in
        </Link>
        <Link className="button button-small" href="/signup">
          Get started
        </Link>
      </nav>
    </header>
  );
}
