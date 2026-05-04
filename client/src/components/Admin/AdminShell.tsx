"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "@/components/Admin/adminIcons";
import { BrandLogo } from "@/components/BrandLogo/BrandLogo";
import { SearchIcon } from "@/components/Icons/Icons";

import "./Admin.scss";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  exact?: boolean;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileTextIcon },
  { href: "/admin/comments", label: "Comments", icon: MessageIcon, soon: true },
  { href: "/admin/taxonomy", label: "Categories & Tags", icon: TagsIcon },
  { href: "/admin/media", label: "Media library", icon: MediaIcon, soon: true },
  { href: "/admin/profile", label: "Profile", icon: ProfileIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

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
        <p>Checking permissions…</p>
      </main>
    );
  }

  const initials = (user?.nickname || "?").slice(0, 2).toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <BrandLogo />
        </div>

        <nav className="admin-sidebar-nav">
          <Link href="/admin/articles/new" className="admin-cta">
            <PlusIcon /> New article
          </Link>

          <ul>
            {NAV.map((item) => {
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
                      <span>{item.label}</span>
                      <span className="admin-soon">soon</span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link className={className} href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-back">
            ← Back to site
          </Link>
        </div>
      </aside>

      <div className="admin-frame">
        <header className="admin-topbar">
          <label className="admin-search">
            <SearchIcon />
            <input type="search" placeholder="Search articles, comments…" />
          </label>
          <button type="button" className="admin-bell" aria-label="Notifications">
            <BellIcon />
          </button>
          <div className="admin-user-menu" ref={menuRef}>
            <button
              type="button"
              className="admin-avatar"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
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
                  Profile
                </Link>
                <Link
                  href="/"
                  className="admin-user-menu__item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Back to site
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
                  Sign out
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
