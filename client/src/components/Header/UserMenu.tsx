"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";

export function UserMenu() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
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
    return <span className="user-menu-skeleton" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <>
        <Link className="signin-link" href="/signin">
          Sign in
        </Link>
        <Link className="button button-small" href="/signup">
          Get started
        </Link>
      </>
    );
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const initial = user.nickname?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="user-name">{user.nickname}</span>
      </button>
      {open ? (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-head">
            <strong>{user.nickname}</strong>
            <span>{user.email}</span>
            <span className={`role-pill role-${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
          {isAdmin ? (
            <Link className="user-menu-item" href="/admin" role="menuitem" onClick={() => setOpen(false)}>
              Admin dashboard
            </Link>
          ) : null}
          <button
            type="button"
            className="user-menu-item user-menu-danger"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
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
  );
}
