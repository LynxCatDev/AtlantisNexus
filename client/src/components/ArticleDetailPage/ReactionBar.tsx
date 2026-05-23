"use client";

import {
  Flame as FlameIcon,
  Heart as HeartIcon,
  Laugh as LaughIcon,
  PartyPopper as PartyPopperIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ComponentType } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { apiFetch } from "@/lib/api";

type ReactionType = "applause" | "funny" | "heart" | "fire";

type ReactionSummary = {
  counts: Partial<Record<ReactionType, number>>;
  total: number;
  mine: ReactionType[];
};

const REACTIONS: { type: ReactionType; Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>; key: string }[] = [
  { type: "applause", Icon: PartyPopperIcon, key: "applause" },
  { type: "funny", Icon: LaughIcon, key: "funny" },
  { type: "heart", Icon: HeartIcon, key: "heart" },
  { type: "fire", Icon: FlameIcon, key: "fire" },
];

type Props = {
  slug: string;
  initialCounts: Partial<Record<ReactionType, number>>;
};

export function ReactionBar({ slug, initialCounts }: Props) {
  const t = useTranslations("articleDetail");
  const { user, authedFetch } = useAuth();
  const [counts, setCounts] = useState<Partial<Record<ReactionType, number>>>(initialCounts);
  const [mine, setMine] = useState<Set<ReactionType>>(new Set());
  const [pending, setPending] = useState<ReactionType | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetcher = user ? authedFetch : apiFetch;
        const data = await fetcher<ReactionSummary>(
          `/articles/${encodeURIComponent(slug)}/reactions`,
        );
        if (cancelled) return;
        setCounts(data.counts);
        setMine(new Set(data.mine));
      } catch {
        // ignore — fall back to initial counts
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, user, authedFetch]);

  const toggle = async (type: ReactionType) => {
    if (!user || pending) return;
    setPending(type);
    try {
      const data = await authedFetch<ReactionSummary>(
        `/articles/${encodeURIComponent(slug)}/reactions`,
        { method: "POST", body: { type } },
      );
      setCounts(data.counts);
      setMine(new Set(data.mine));
    } catch {
      // ignore — UI keeps last good state
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="article-detail__reactions" aria-label={t("reactionsAriaLabel")}>
      {REACTIONS.map(({ type, Icon, key }) => {
        const active = mine.has(type);
        const count = counts[type] ?? 0;
        return (
          <button
            key={type}
            type="button"
            className={`article-detail__reaction${active ? " is-active" : ""}`}
            aria-pressed={active}
            disabled={!user || pending === type}
            title={!user ? t("reactionSignInHint") : undefined}
            onClick={() => toggle(type)}
          >
            <Icon aria-hidden size={16} />
            {t(key)}
            <span className="article-detail__reaction-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
