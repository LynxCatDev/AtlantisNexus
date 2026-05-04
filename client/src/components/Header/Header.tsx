import Link from "next/link";

import { mainNavigation } from "@/constants/navigation";

import { BrandLogo } from "../BrandLogo/BrandLogo";
import { SearchIcon } from "../Icons/Icons";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import "./Header.scss";

type HeaderProps = {
  activeLabel?: string;
};

export function Header({ activeLabel }: HeaderProps) {
  return (
    <header className="header">
      <nav className="header__nav" aria-label="Primary navigation">
        <BrandLogo />
        <div className="header__nav-links" aria-label="Sections">
          {mainNavigation.map((item) => (
            <Link
              className={
                item.label === activeLabel
                  ? "header__nav-link header__nav-link--active"
                  : "header__nav-link"
              }
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link className="header__search" href="/search">
          <SearchIcon />
          <span>Search articles, tools...</span>
          <kbd>{"⌘K"}</kbd>
        </Link>
        <LanguageSwitcher />
        <UserMenu />
      </nav>
    </header>
  );
}
