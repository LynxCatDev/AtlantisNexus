"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowUpRightIcon,
  EyeIcon,
  FileTextIcon,
  MessageIcon,
  PencilIcon,
  PlusIcon,
  SparkleIcon,
  TrendUpIcon,
} from "@/components/Admin/adminIcons";
import { useAuth } from "@/components/Auth/AuthProvider";

type AdminArticle = {
  id: string;
  slug: string;
  image: string;
  minutes: string;
  category: { slug: string; label: string };
  createdAt: string;
  translations: { locale: string; title: string }[];
  _count?: { comments: number; reactions: number };
};

type Tone = "primary" | "cyan" | "violet" | "gold";

type StatProps = {
  label: string;
  value: string;
  change: string;
  tone: Tone;
  icon: (props: { className?: string }) => React.ReactElement;
};

function StatCard({ label, value, change, tone, icon: Icon }: StatProps) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-orb" aria-hidden="true" />
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-change">
          <TrendUpIcon /> {change}
        </p>
      </div>
      <span className="stat-icon">
        <Icon />
      </span>
    </div>
  );
}

export function AdminDashboard() {
  const { user, authedFetch } = useAuth();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authedFetch<AdminArticle[]>("/articles?locale=en");
        if (!cancelled) setArticles(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load articles.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authedFetch]);

  const recentArticles = articles.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <p className="eyebrow eyebrow-cyan">Overview</p>
          <h1>Welcome back, {user?.nickname}</h1>
          <p>Here&rsquo;s what&rsquo;s happening across the platform today.</p>
        </div>
        <Link href="/admin/articles/new" className="admin-cta admin-cta-pill">
          <PlusIcon /> New article
        </Link>
      </header>

      <div className="stat-grid">
        <StatCard
          label="Published"
          value={String(articles.length)}
          change={articles.length === 0 ? "Awaiting first post" : "Live now"}
          tone="primary"
          icon={FileTextIcon}
        />
        <StatCard label="Pageviews" value="—" change="Analytics soon" tone="cyan" icon={EyeIcon} />
        <StatCard
          label="Comments"
          value={String(
            articles.reduce((sum, a) => sum + (a._count?.comments ?? 0), 0),
          )}
          change="Across all articles"
          tone="violet"
          icon={MessageIcon}
        />
        <StatCard
          label="Reactions"
          value={String(
            articles.reduce((sum, a) => sum + (a._count?.reactions ?? 0), 0),
          )}
          change="Likes & emotions"
          tone="gold"
          icon={SparkleIcon}
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card dashboard-card-wide">
          <header className="dashboard-card-head">
            <h3>Recent articles</h3>
            <Link className="link-cyan" href="/admin/articles/new">
              New article <ArrowUpRightIcon />
            </Link>
          </header>

          {error ? (
            <p className="admin-error" role="alert">
              {error}
            </p>
          ) : null}

          {!error && recentArticles.length === 0 ? (
            <div className="dashboard-empty">
              <p>No articles yet.</p>
              <Link href="/admin/articles/new" className="link-cyan">
                Publish your first article →
              </Link>
            </div>
          ) : null}

          <div className="recent-list">
            {recentArticles.map((article) => {
              const enTitle =
                article.translations.find((t) => t.locale === "en")?.title ??
                article.translations[0]?.title ??
                article.slug;
              return (
                <article key={article.id} className="recent-row">
                  {article.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="recent-thumb" src={article.image} alt="" />
                  ) : (
                    <span className="recent-thumb recent-thumb-placeholder" aria-hidden="true" />
                  )}
                  <div className="recent-row-body">
                    <p className="recent-title">{enTitle}</p>
                    <p className="recent-meta">
                      {article.category.label} ·{" "}
                      {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="status-pill status-published">Published</span>
                  <Link
                    className="recent-action"
                    href={`/article/${article.slug}`}
                    aria-label={`Open ${enTitle}`}
                  >
                    <PencilIcon />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="dashboard-card">
          <header className="dashboard-card-head">
            <h3>Recent comments</h3>
            <span className="link-cyan link-cyan-muted">Moderation soon</span>
          </header>
          <div className="recent-list recent-list-comments">
            <div className="dashboard-empty">
              <p>Comment moderation hasn&rsquo;t shipped yet.</p>
              <p className="recent-meta">Once readers start commenting they&rsquo;ll show up here.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
