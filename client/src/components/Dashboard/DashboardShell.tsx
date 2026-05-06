"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Header } from "@/components/Header/Header";

import "./DashboardShell.scss";

type NavItem = {
  href: string;
  labelKey: "profile";
  exact?: boolean;
};

const NAV: NavItem[] = [{ href: "/dashboard/profile", labelKey: "profile", exact: true }];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("dashboard");

  useEffect(() => {
    if (status === "ready" && !user) {
      router.replace("/signin");
    }
  }, [status, user, router]);

  if (status === "loading" || !user) {
    return (
      <main className="dashboard-loading" aria-busy="true">
        <p>{t("loading")}</p>
      </main>
    );
  }

  return (
    <>
      <Header activeLabel="Dashboard" />
      <main className="dashboard-shell">
        <aside className="dashboard-sidebar" aria-label={t("navAriaLabel")}>
          <div className="dashboard-sidebar__header">
            <span className="dashboard-sidebar__eyebrow">{t("sidebarEyebrow")}</span>
            <strong>{user.nickname}</strong>
            <span className="dashboard-sidebar__email">{user.email}</span>
          </div>
          <nav>
            <ul>
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href) ?? false;
                return (
                  <li key={item.href}>
                    <Link
                      className={`dashboard-nav-link${active ? " active" : ""}`}
                      href={item.href}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        <section className="dashboard-content">{children}</section>
      </main>
    </>
  );
}
