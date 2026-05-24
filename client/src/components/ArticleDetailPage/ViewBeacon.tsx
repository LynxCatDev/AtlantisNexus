"use client";

import { useEffect } from "react";

import { apiFetch } from "@/lib/api";

const COOLDOWN_MS = 30 * 1000;
const STORAGE_PREFIX = "atlantis:viewed:";

type Props = {
  slug: string;
};

export function ViewBeacon({ slug }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = `${STORAGE_PREFIX}${slug}`;
    const now = Date.now();
    const last = Number(window.localStorage.getItem(key) ?? 0);
    if (Number.isFinite(last) && now - last < COOLDOWN_MS) return;

    window.localStorage.setItem(key, String(now));

    void apiFetch(`/articles/${encodeURIComponent(slug)}/views`, {
      method: "POST",
    }).catch(() => {
      // Roll back the timestamp if the request failed so the next load retries.
      window.localStorage.removeItem(key);
    });
  }, [slug]);

  return null;
}
