"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/Auth/AuthProvider";
import { apiFetch } from "@/lib/api";

import "./OnlineIndicator.scss";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const SESSION_STORAGE_KEY = "atlantis:presenceSessionId";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && existing.length >= 8) return existing;
  const next =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

export function OnlineIndicator() {
  const t = useTranslations("presence");
  const { user, authedFetch } = useAuth();
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    let cancelled = false;

    const ping = async () => {
      try {
        const fetcher = user ? authedFetch : apiFetch;
        const data = await fetcher<{ online: number }>("/presence/heartbeat", {
          method: "POST",
          body: { sessionId },
        });
        if (!cancelled) setOnline(data.online);
      } catch {
        // ignore — keep last known value
      }
    };

    void ping();
    const id = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user, authedFetch]);

  if (online === null) return null;

  return (
    <div
      className="online-indicator"
      role="status"
      aria-live="polite"
      title={t("tooltip", { count: online })}
    >
      <span className="online-indicator__dot" aria-hidden="true" />
      <span className="online-indicator__count">{online}</span>
    </div>
  );
}
