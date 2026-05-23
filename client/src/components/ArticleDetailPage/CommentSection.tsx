"use client";

import { Send as SendIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/Button/Button";
import { locales, type Locale } from "@/i18n/config";
import { apiFetch } from "@/lib/api";
import type { Role } from "@/types/auth";

type BackendComment = {
  id: string;
  body: string;
  locale: Locale;
  author: string;
  avatar: string | null;
  role: Role;
  userId: string;
  createdAt: string;
};

type Filter = "all" | Locale;

type Props = {
  slug: string;
};

export function CommentSection({ slug }: Props) {
  const t = useTranslations("articleDetail");
  const locale = useLocale() as Locale;
  const { user, authedFetch } = useAuth();
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(locale);

  useEffect(() => {
    setFilter(locale);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<BackendComment[]>(
          `/articles/${encodeURIComponent(slug)}/comments`,
        );
        if (!cancelled) setComments(data);
      } catch {
        // ignore — empty list will show
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const counts = useMemo(() => {
    const map: Record<Locale, number> = locales.reduce(
      (acc, l) => ({ ...acc, [l]: 0 }),
      {} as Record<Locale, number>,
    );
    for (const c of comments) {
      if ((locales as readonly string[]).includes(c.locale)) {
        map[c.locale] += 1;
      }
    }
    return map;
  }, [comments]);

  const visible = useMemo(
    () => (filter === "all" ? comments : comments.filter((c) => c.locale === filter)),
    [comments, filter],
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await authedFetch<BackendComment>(
        `/articles/${encodeURIComponent(slug)}/comments`,
        { method: "POST", body: { body: trimmed, locale } },
      );
      setComments((prev) => [created, ...prev]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("postError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="article-detail__comments" aria-labelledby="comments-title">
      <h2 id="comments-title">{t("commentsHeading")}</h2>

      {user ? (
        <form className="article-detail__comment-form" onSubmit={onSubmit}>
          <textarea
            aria-label={t("commentAriaLabel")}
            placeholder={t("commentPlaceholder")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
          />
          {error ? (
            <p className="article-detail__comment-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={submitting || body.trim().length === 0}>
            {submitting ? t("posting") : t("postComment")}
            <SendIcon aria-hidden="true" size={16} style={{ marginLeft: 4 }} />
          </Button>
        </form>
      ) : (
        <p className="article-detail__comment-signin">{t("signInToComment")}</p>
      )}

      <div
        className="article-detail__comment-filters"
        role="tablist"
        aria-label={t("commentFiltersAriaLabel")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          className={`article-detail__comment-filter${filter === "all" ? " is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          {t("commentFilterAll")}
          <span className="article-detail__comment-filter-count">{comments.length}</span>
        </button>
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={filter === l}
            className={`article-detail__comment-filter${filter === l ? " is-active" : ""}`}
            onClick={() => setFilter(l)}
          >
            {l.toUpperCase()}
            <span className="article-detail__comment-filter-count">{counts[l]}</span>
          </button>
        ))}
      </div>

      <div className="article-detail__comment-list">
        {visible.length === 0 ? (
          <p className="article-detail__comment-empty">{t("noComments")}</p>
        ) : (
          visible.map((comment) => (
            <article className="article-detail__comment" key={comment.id}>
              <span
                className="article-detail__avatar"
                style={
                  comment.avatar
                    ? {
                        backgroundImage: `url(${comment.avatar})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {comment.avatar ? null : initials(comment.author)}
              </span>
              <div>
                <p>
                  <strong>{comment.author}</strong>
                  {comment.role !== "USER" ? (
                    <span
                      className={`article-detail__role-pill article-detail__role-pill--${comment.role.toLowerCase()}`}
                    >
                      {t(comment.role === "SUPERADMIN" ? "roleSuperadmin" : "roleAdmin")}
                    </span>
                  ) : null}
                  <span>{formatPostedAt(comment.createdAt)}</span>
                </p>
                <p>{comment.body}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPostedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}
