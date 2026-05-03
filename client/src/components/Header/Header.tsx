import Link from "next/link";

import { mainNavigation } from "@/constants/navigation";

import { BrandLogo } from "../BrandLogo/BrandLogo";
import { SearchIcon } from "../Icons/Icons";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { UserMenu } from "./UserMenu";

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
        <Link className="search-box" href="/search">
          <SearchIcon />
          <span>Search articles, tools...</span>
          <kbd>{"\u2318K"}</kbd>
        </Link>
        <LanguageSwitcher />
        <UserMenu />
      </nav>
    </header>
  );
}
