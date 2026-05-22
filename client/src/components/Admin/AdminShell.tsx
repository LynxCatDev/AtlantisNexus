"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import {
  BellIcon,
  DashboardIcon,
  FileTextIcon,
  MediaIcon,
  MessageIcon,
  PlusIcon,
  ProfileIcon,
  TagsIcon,
  UsersIcon,
} from "@/components/Admin/adminIcons";
import { BrandLogo } from "@/components/BrandLogo/BrandLogo";
import { SearchIcon } from "@/components/Icons/Icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";

import "./Admin.scss";

type NavKey =
  | "dashboard"
  | "articles"
  | "comments"
  | "taxonomy"
  | "users"
  | "media"
  | "profile";

type NavItem = {
  href: string;
  labelKey: NavKey;
  icon: (props: { className?: string }) => React.ReactElement;
  exact?: boolean;
  soon?: boolean;
  superadminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/articles", labelKey: "articles", icon: FileTextIcon },
  { href: "/admin/comments", labelKey: "comments", icon: MessageIcon, soon: true },
  { href: "/admin/taxonomy", labelKey: "taxonomy", icon: TagsIcon },
  { href: "/admin/users", labelKey: "users", icon: UsersIcon, superadminOnly: true },
  { href: "/admin/media", labelKey: "media", icon: MediaIcon, soon: true },
  { href: "/admin/profile", labelKey: "profile", icon: ProfileIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperadmin = user?.role === "SUPERADMIN";

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (status === "ready" && !isAdmin) {
      router.replace(user ? "/" : "/signin");
    }
  }, [status, isAdmin, user, router]);

  if (status === "loading" || !isAdmin) {
    return (
      <main className="admin-loading" aria-busy="true">
        <p>{t("checkingPermissions")}</p>
      </main>
    );
  }

  const initials = (user?.nickname || "?").slice(0, 2).toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label={t("navAriaLabel")}>
        <div className="admin-sidebar-brand">
          <BrandLogo />
        </div>

        <nav className="admin-sidebar-nav">
          <Link href="/admin/articles/new" className="admin-cta">
            <PlusIcon /> {t("newArticle")}
          </Link>

          <ul>
            {NAV.filter((item) => !item.superadminOnly || isSuperadmin).map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href) ?? false;
              const Icon = item.icon;
              const className = `admin-nav-link${active ? " active" : ""}${
                item.soon ? " is-soon" : ""
              }`;
              if (item.soon) {
                return (
                  <li key={item.href}>
                    <span className={className} aria-disabled="true">
                      <Icon />
                      <span>{t(item.labelKey)}</span>
                      <span className="admin-soon">{t("soon")}</span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link className={className} href={item.href}>
                    <Icon />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-back">
            {t("backToSite")}
          </Link>
        </div>
      </aside>

      <div className="admin-frame">
        <header className="admin-topbar">
          <label className="admin-search">
            <SearchIcon />
            <input type="search" placeholder={t("searchPlaceholder")} />
          </label>
          <button type="button" className="admin-bell" aria-label={t("notifications")}>
            <BellIcon />
          </button>
          <div className="admin-language">
            <LanguageSwitcher />
          </div>
          <div className="admin-user-menu" ref={menuRef}>
            <button
              type="button"
              className="admin-avatar"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t("accountMenu")}
              onClick={() => setMenuOpen((v) => !v)}
              style={
                user?.avatar
                  ? { backgroundImage: `url(${user.avatar})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {user?.avatar ? null : initials}
            </button>
            {menuOpen ? (
              <div className="admin-user-menu__panel" role="menu">
                <div className="admin-user-menu__head">
                  <strong>{user?.nickname}</strong>
                  <span>{user?.email}</span>
                </div>
                <Link
                  href="/admin/profile"
                  className="admin-user-menu__item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("menuProfile")}
                </Link>
                <Link
                  href="/"
                  className="admin-user-menu__item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("menuBackToSite")}
                </Link>
                <button
                  type="button"
                  className="admin-user-menu__item admin-user-menu__item--danger"
                  role="menuitem"
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                    router.push("/");
                    router.refresh();
                  }}
                >
                  {t("menuSignOut")}
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </div>
    </div>
  );
}
