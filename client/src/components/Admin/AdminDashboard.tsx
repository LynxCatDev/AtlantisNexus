"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";

type AdminArticle = {
  id: string;
  slug: string;
  title: string;
  image: string;
  minutes: string;
  category: { slug: string; label: string; isMain: boolean };
  author: string;
  publishedAt: string;
  counts?: { comments: number; reactions: number };
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
  const t = useTranslations("admin");
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
          <Eyebrow className="eyebrow-cyan">{t("overview")}</Eyebrow>
          <h1>{t("welcomeBack", { name: user?.nickname ?? "" })}</h1>
          <p>{t("welcomeLede")}</p>
        </div>
        <Link href="/admin/articles/new" className="admin-cta admin-cta-pill">
          <PlusIcon /> {t("newArticle")}
        </Link>
      </header>

      <div className="stat-grid">
        <StatCard
          label={t("statPublished")}
          value={String(articles.length)}
          change={articles.length === 0 ? t("changeAwaitingPost") : t("changeLiveNow")}
          tone="primary"
          icon={FileTextIcon}
        />
        <StatCard
          label={t("statPageviews")}
          value="—"
          change={t("changeAnalyticsSoon")}
          tone="cyan"
          icon={EyeIcon}
        />
        <StatCard
          label={t("statComments")}
          value={String(
            articles.reduce((sum, a) => sum + (a.counts?.comments ?? 0), 0),
          )}
          change={t("changeAcrossArticles")}
          tone="violet"
          icon={MessageIcon}
        />
        <StatCard
          label={t("statReactions")}
          value={String(
            articles.reduce((sum, a) => sum + (a.counts?.reactions ?? 0), 0),
          )}
          change={t("changeLikesEmotions")}
          tone="gold"
          icon={SparkleIcon}
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card dashboard-card-wide">
          <header className="dashboard-card-head">
            <h3>{t("recentArticles")}</h3>
            <Link className="link-cyan" href="/admin/articles/new">
              {t("newArticle")} <ArrowUpRightIcon />
            </Link>
          </header>

          {error ? (
            <p className="admin-error" role="alert">
              {error}
            </p>
          ) : null}

          {!error && recentArticles.length === 0 ? (
            <div className="dashboard-empty">
              <p>{t("noArticles")}</p>
              <Link href="/admin/articles/new" className="link-cyan">
                {t("publishFirst")}
              </Link>
            </div>
          ) : null}

          <div className="recent-list">
            {recentArticles.map((article) => {
              const title = article.title || article.slug;
              return (
                <article key={article.id} className="recent-row">
                  {article.image ? (
                    <span
                      aria-hidden="true"
                      className="recent-thumb"
                      style={{ backgroundImage: `url(${article.image})` }}
                    />
                  ) : (
                    <span className="recent-thumb recent-thumb-placeholder" aria-hidden="true" />
                  )}
                  <div className="recent-row-body">
                    <p className="recent-title">{title}</p>
                    <p className="recent-meta">
                      {article.category.label} ·{" "}
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="status-pill status-published">{t("statusPublished")}</span>
                  <Link
                    className="recent-action"
                    href={`/admin/articles/${article.slug}/edit`}
                    aria-label={t("openArticle", { title })}
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
            <h3>{t("recentComments")}</h3>
            <span className="link-cyan link-cyan-muted">{t("moderationSoon")}</span>
          </header>
          <div className="recent-list recent-list-comments">
            <div className="dashboard-empty">
              <p>{t("moderationNotShipped")}</p>
              <p className="recent-meta">{t("moderationOnceReaders")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
