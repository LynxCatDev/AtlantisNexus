import Link from "next/link";
import { useTranslations } from "next-intl";

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
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");

  return (
    <header className="header">
      <nav className="header__nav" aria-label="Primary navigation">
        <BrandLogo />
        <div className="header__nav-links" aria-label="Sections">
          {mainNavigation.map((item) => {
            const label = item.labelKey
              ? tNav(item.labelKey as Parameters<typeof tNav>[0])
              : item.label;
            return (
              <Link
                className={
                  item.label === activeLabel
                    ? "header__nav-link header__nav-link--active"
                    : "header__nav-link"
                }
                href={item.href}
                key={item.label}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <Link className="header__search" href="/search">
          <SearchIcon />
          <span>{tHeader("searchPlaceholder")}</span>
          <kbd>{"⌘K"}</kbd>
        </Link>
        <LanguageSwitcher />
        <UserMenu />
      </nav>
    </header>
  );
}
