"use client";

import Link from "next/link";
import {
  LayoutDashboard as DashboardIcon,
  LogOut as LogOutIcon,
  Shield as ShieldIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/Button/Button";

export function UserMenu() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("userMenu");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (status === "loading") {
    return <span className="user-menu__skeleton" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <>
        <Link className="header__signin" href="/signin">
          {t("signIn")}
        </Link>
        <Button size="small" href="/signup">
          {t("getStarted")}
        </Button>
      </>
    );
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const initial = user.nickname?.[0]?.toUpperCase() ?? "?";
  const inDashboard = pathname?.startsWith("/dashboard") ?? false;

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="user-menu__avatar"
          aria-hidden="true"
          style={
            user.avatar
              ? { backgroundImage: `url(${user.avatar})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {user.avatar ? null : initial}
        </span>
        <span className="user-menu__name">{user.nickname}</span>
      </button>
      {open ? (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__head">
            <strong>{user.nickname}</strong>
            <span>{user.email}</span>
            <span className={`role-pill role-pill--${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
          {isAdmin ? (
            <Link className="user-menu__item" href="/admin" role="menuitem" onClick={() => setOpen(false)}>
              <ShieldIcon aria-hidden="true" size={16} />
              {t("adminDashboard")}
            </Link>
          ) : (
            <Link
              className="user-menu__item"
              href="/dashboard/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <DashboardIcon aria-hidden="true" size={16} />
              {t("dashboard")}
            </Link>
          )}
          {inDashboard ? (
            <Link className="user-menu__item" href="/" role="menuitem" onClick={() => setOpen(false)}>
              {t("backToSite")}
            </Link>
          ) : null}
          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push("/");
              router.refresh();
            }}
          >
            <LogOutIcon aria-hidden="true" size={16} />
            {t("signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
