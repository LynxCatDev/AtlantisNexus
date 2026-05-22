"use client";

import {
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Tags as TagsIcon,
  Trash2 as Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { articles } from "@/constants/articles";
import type { Category } from "@/types/auth";

export function AdminTaxonomyPage() {
  const { authedFetch, user } = useAuth();
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSuperadmin = user?.role === "SUPERADMIN";

  const loadCategories = useCallback(async (cancelled: () => boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authedFetch<Category[]>("/categories");
      if (!cancelled()) setCategories(data);
    } catch (err) {
      if (!cancelled()) {
        setError(err instanceof Error ? err.message : t("taxonomyFailedLoad"));
      }
    } finally {
      if (!cancelled()) setLoading(false);
    }
  }, [authedFetch, t]);

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      void loadCategories(() => cancelled);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [loadCategories]);

  const tags = useMemo(
    () => Array.from(new Set(articles.flatMap((article) => article.tags))).sort(),
    [],
  );

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSuperadmin) {
      setNotice(t("taxonomySuperadminOnly"));
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const created = await authedFetch<Category>("/categories", {
        method: "POST",
        body: {
          slug: slug.trim(),
          label: label.trim(),
          ...(position.trim() ? { position: Number(position) } : {}),
        },
      });
      setCategories((current) => [...current, created].sort((a, b) => a.position - b.position));
      setSlug("");
      setLabel("");
      setPosition("");
      setNotice(t("taxonomyCreated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("taxonomyFailedCreate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">{t("taxonomyEyebrow")}</Eyebrow>
          <h1>{t("taxonomyTitle")}</h1>
          <p>{t("taxonomyLede")}</p>
        </div>
      </header>

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

      <div className="taxonomy-grid">
        <section className="admin-card" aria-busy={loading} aria-labelledby="categories-title">
          <div className="admin-card-headline">
            <span className="stat-icon stat-primary">
              <TagsIcon />
            </span>
            <div>
              <h2 id="categories-title">{t("taxonomyCategoriesTitle")}</h2>
              <p>{t("taxonomyCategoriesDesc")}</p>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-empty">{t("taxonomyLoading")}</div>
          ) : (
            <div className="taxonomy-list">
              {categories.map((category) => (
                <article className="taxonomy-item" key={category.slug}>
                  <div>
                    <strong>{category.label}</strong>
                    <p className="taxonomy-meta">
                      {t("taxonomyPositionMeta", { slug: category.slug, position: category.position })}
                    </p>
                  </div>
                  <div className="taxonomy-actions">
                    <span className={category.isMain ? "status-pill status-published" : "status-pill status-draft"}>
                      {category.isMain ? t("taxonomyMain") : t("taxonomyExtra")}
                    </span>
                    {category.isMain ? (
                      <>
                        <button disabled type="button">
                          <PencilIcon aria-hidden="true" size={16} />
                          {t("taxonomyEdit")}
                        </button>
                        <button disabled type="button">
                          <Trash2Icon aria-hidden="true" size={16} />
                          {t("taxonomyDelete")}
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-card" aria-labelledby="new-category-title">
          <div className="admin-card-headline">
            <span className="stat-icon stat-cyan">
              <PlusIcon />
            </span>
            <div>
              <h2 id="new-category-title">{t("taxonomyAddTitle")}</h2>
              <p>{t("taxonomyAddDesc")}</p>
            </div>
          </div>

          <form className="taxonomy-form" onSubmit={onCreate}>
            <label className="admin-field">
              <span>{t("taxonomyLabel")}</span>
              <input
                disabled={!isSuperadmin}
                onChange={(event) => {
                  const nextLabel = event.target.value;
                  setLabel(nextLabel);
                  setSlug((current) => current || slugify(nextLabel));
                }}
                required
                value={label}
              />
            </label>
            <label className="admin-field">
              <span>{t("taxonomySlug")}</span>
              <input
                disabled={!isSuperadmin}
                onChange={(event) => setSlug(event.target.value)}
                required
                value={slug}
              />
            </label>
            <label className="admin-field">
              <span>{t("taxonomyPosition")}</span>
              <input
                disabled={!isSuperadmin}
                min="0"
                onChange={(event) => setPosition(event.target.value)}
                placeholder={t("taxonomyPositionPlaceholder")}
                type="number"
                value={position}
              />
            </label>
            <button className="admin-cta" disabled={!isSuperadmin || submitting} type="submit">
              <PlusIcon aria-hidden="true" size={16} />
              {submitting ? t("taxonomyCreating") : t("taxonomyCreate")}
            </button>
          </form>
        </section>

        <section className="admin-card taxonomy-tags" aria-labelledby="tags-title">
          <h2 id="tags-title">{t("taxonomyTagsTitle")}</h2>
          <p>{t("taxonomyTagsDesc")}</p>
          <div className="tag-cloud">
            {tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
