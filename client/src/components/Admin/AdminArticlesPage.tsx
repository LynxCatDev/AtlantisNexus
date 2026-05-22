"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PencilIcon, PlusIcon } from "@/components/Admin/adminIcons";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";

type AdminArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: { slug: string; label: string; isMain: boolean };
  author: string;
  publishedAt: string;
  minutes: string;
  image: string;
  tags: string[];
  counts?: { comments: number; reactions: number };
};

type ArticleTab = "All" | "Published" | "Drafts" | "Scheduled";

const tabs: ArticleTab[] = ["All", "Published", "Drafts", "Scheduled"];

export function AdminArticlesPage() {
  const { authedFetch } = useAuth();
  const t = useTranslations("admin");
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [activeTab, setActiveTab] = useState<ArticleTab>("All");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const tabLabel = (tab: ArticleTab) => {
    switch (tab) {
      case "All":
        return t("articlesTabAll");
      case "Published":
        return t("articlesTabPublished");
      case "Drafts":
        return t("articlesTabDrafts");
      case "Scheduled":
        return t("articlesTabScheduled");
    }
  };

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authedFetch<AdminArticle[]>("/articles?locale=en");
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("articlesFailedLoad"));
    } finally {
      setLoading(false);
    }
  }, [authedFetch, t]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadArticles();
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [loadArticles]);

  const visibleArticles = useMemo(() => {
    if (activeTab === "All" || activeTab === "Published") {
      return articles;
    }

    return [];
  }, [activeTab, articles]);

  const deleteArticle = async (article: AdminArticle) => {
    const confirmed = window.confirm(
      t("articlesConfirmDelete", { title: article.title || article.slug }),
    );
    if (!confirmed) return;

    setDeletingSlug(article.slug);
    setError(null);
    try {
      await authedFetch<void>(`/articles/${encodeURIComponent(article.slug)}`, {
        method: "DELETE",
      });
      setArticles((current) => current.filter((item) => item.slug !== article.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("articlesFailedDelete"));
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">{t("articlesPageEyebrow")}</Eyebrow>
          <h1>{t("articlesPageTitle")}</h1>
          <p>{t("articlesPageLede")}</p>
        </div>
        <Link href="/admin/articles/new" className="admin-cta admin-cta-pill">
          <PlusIcon /> {t("newArticle")}
        </Link>
      </header>

      <div className="admin-tabs" aria-label={t("articlesStatusAriaLabel")}>
        {tabs.map((tab) => (
          <button
            aria-pressed={activeTab === tab}
            className={activeTab === tab ? "admin-tab active" : "admin-tab"}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="admin-table-card" aria-busy={loading}>
        <div className="admin-table-head">
          <h2>{t("articlesHeading", { tab: tabLabel(activeTab) })}</h2>
          <span>{t("articlesItems", { count: visibleArticles.length })}</span>
        </div>

        {loading ? (
          <div className="dashboard-empty">{t("articlesLoading")}</div>
        ) : visibleArticles.length > 0 ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("articlesColArticle")}</th>
                  <th>{t("articlesColCategory")}</th>
                  <th>{t("articlesColAuthor")}</th>
                  <th>{t("articlesColDate")}</th>
                  <th>{t("articlesColStatus")}</th>
                  <th aria-label={t("articlesColActions")} />
                </tr>
              </thead>
              <tbody>
                {visibleArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="admin-article-cell">
                        <span
                          aria-hidden="true"
                          className="admin-table-thumb"
                          style={{ backgroundImage: article.image ? `url(${article.image})` : undefined }}
                        />
                        <div>
                          <strong>{article.title || article.slug}</strong>
                          <span>{article.excerpt || article.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{article.category.label}</td>
                    <td>{article.author}</td>
                    <td>{formatDate(article.publishedAt, t("articlesUnknownDate"))}</td>
                    <td>
                      <span className="status-pill status-published">{t("statusPublished")}</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          aria-label={t("openArticle", { title: article.title || article.slug })}
                          className="admin-icon-button"
                          href={`/article/${article.slug}`}
                        >
                          <PencilIcon />
                        </Link>
                        <button
                          className="admin-danger-button"
                          disabled={deletingSlug === article.slug}
                          onClick={() => void deleteArticle(article)}
                          type="button"
                        >
                          {deletingSlug === article.slug ? t("articlesDeleting") : t("articlesDelete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty">
            {activeTab === "All" || activeTab === "Published"
              ? t("noArticles")
              : t("articlesNotWired", { tab: tabLabel(activeTab) })}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string, fallback: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString();
}
