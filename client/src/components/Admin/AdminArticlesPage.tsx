"use client";

import Link from "next/link";
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
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [activeTab, setActiveTab] = useState<ArticleTab>("All");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authedFetch<AdminArticle[]>("/articles?locale=en");
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

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
    const confirmed = window.confirm(`Delete "${article.title || article.slug}"?`);
    if (!confirmed) return;

    setDeletingSlug(article.slug);
    setError(null);
    try {
      await authedFetch<void>(`/articles/${encodeURIComponent(article.slug)}`, {
        method: "DELETE",
      });
      setArticles((current) => current.filter((item) => item.slug !== article.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article.");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">Articles</Eyebrow>
          <h1>Editorial library</h1>
          <p>Manage published stories while drafts and scheduling are still being added.</p>
        </div>
        <Link href="/admin/articles/new" className="admin-cta admin-cta-pill">
          <PlusIcon /> New article
        </Link>
      </header>

      <div className="admin-tabs" aria-label="Article status">
        {tabs.map((tab) => (
          <button
            aria-pressed={activeTab === tab}
            className={activeTab === tab ? "admin-tab active" : "admin-tab"}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
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
          <h2>{activeTab} articles</h2>
          <span>{visibleArticles.length} items</span>
        </div>

        {loading ? (
          <div className="dashboard-empty">Loading articles...</div>
        ) : visibleArticles.length > 0 ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
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
                    <td>{formatDate(article.publishedAt)}</td>
                    <td>
                      <span className="status-pill status-published">Published</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          aria-label={`Open ${article.title || article.slug}`}
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
                          {deletingSlug === article.slug ? "Deleting" : "Delete"}
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
              ? "No articles yet."
              : `${activeTab} articles are not wired yet.`}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString();
}
