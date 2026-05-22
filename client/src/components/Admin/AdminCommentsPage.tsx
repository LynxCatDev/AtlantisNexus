"use client";

import Link from "next/link";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExternalLink as ExternalLinkIcon,
  Inbox as InboxIcon,
  Trash2 as Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import type { Role } from "@/types/auth";

import "./AdminCommentsPage.scss";

type AdminComment = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
  avatar: string | null;
  role: Role;
  userId: string;
  articleSlug: string;
  articleTitle: string;
};

type CommentsResponse = {
  items: AdminComment[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 20;

export function AdminCommentsPage() {
  const { authedFetch } = useAuth();
  const t = useTranslations("admin");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CommentsResponse>({
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize],
  );

  const load = useCallback(
    async (cancelled: () => boolean) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const trimmed = query.trim();
      if (trimmed) params.set("q", trimmed);

      try {
        const next = await authedFetch<CommentsResponse>(`/comments?${params.toString()}`);
        if (!cancelled()) setData(next);
      } catch (err) {
        if (!cancelled()) {
          setError(err instanceof Error ? err.message : t("commentsFailedLoad"));
        }
      } finally {
        if (!cancelled()) setLoading(false);
      }
    },
    [authedFetch, page, query, t],
  );

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      void load(() => cancelled);
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [load]);

  const deleteComment = async (target: AdminComment) => {
    if (!window.confirm(t("commentsConfirmDelete", { author: target.author }))) return;
    setDeletingId(target.id);
    setError(null);
    setNotice(null);
    try {
      await authedFetch<void>(`/comments/${target.id}`, { method: "DELETE" });
      setNotice(t("commentsDeleted", { author: target.author }));
      await load(() => false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("commentsFailedDelete"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-dashboard admin-comments-page">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">{t("commentsEyebrow")}</Eyebrow>
          <h1>{t("commentsTitle")}</h1>
          <p>{t("commentsLede")}</p>
        </div>
      </header>

      <section className="admin-users-toolbar" aria-label={t("commentsFiltersAriaLabel")}>
        <label className="admin-users-search">
          <span>{t("commentsSearch")}</span>
          <input
            type="search"
            placeholder={t("commentsSearchPlaceholder")}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </section>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      ) : null}

      <section className="admin-table-card" aria-busy={loading}>
        <div className="admin-table-head">
          <h2>{t("commentsTableTitle")}</h2>
          <span className="admin-table-meta">
            {t("commentsTotal", { count: data.total, page: data.page, totalPages })}
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <InboxIcon aria-hidden="true" size={18} />
            <p>{t("commentsLoading")}</p>
          </div>
        ) : data.items.length === 0 ? (
          <div className="dashboard-empty">
            <InboxIcon aria-hidden="true" size={18} />
            <p>{t("commentsEmpty")}</p>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("commentsColAuthor")}</th>
                    <th>{t("commentsColBody")}</th>
                    <th>{t("commentsColArticle")}</th>
                    <th>{t("commentsColDate")}</th>
                    <th aria-label={t("commentsColActions")} />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span
                            aria-hidden="true"
                            className="admin-user-avatar"
                            style={
                              item.avatar
                                ? {
                                    backgroundImage: `url(${item.avatar})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : undefined
                            }
                          >
                            {item.avatar ? null : item.author.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.author}</strong>
                            <span
                              className={`admin-user-pill admin-user-pill--${item.role.toLowerCase()}`}
                            >
                              {item.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="admin-comment-body">{item.body}</td>
                      <td>
                        <Link
                          className="admin-comment-article-link"
                          href={`/article/${item.articleSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.articleTitle}
                          <ExternalLinkIcon aria-hidden="true" size={14} />
                        </Link>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-danger-button"
                            disabled={deletingId === item.id}
                            onClick={() => void deleteComment(item)}
                            type="button"
                          >
                            <Trash2Icon aria-hidden="true" size={16} />
                            {deletingId === item.id
                              ? t("commentsDeleting")
                              : t("commentsDelete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-users-pagination">
              <button
                type="button"
                className="admin-secondary-button"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon aria-hidden="true" size={16} />
                {t("commentsPrev")}
              </button>
              <span>{t("commentsPageOf", { page: data.page, totalPages })}</span>
              <button
                type="button"
                className="admin-secondary-button"
                disabled={data.page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("commentsNext")}
                <ChevronRightIcon aria-hidden="true" size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
