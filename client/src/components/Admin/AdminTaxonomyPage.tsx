"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { PlusIcon, TagsIcon } from "@/components/Admin/adminIcons";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { articles } from "@/constants/articles";
import type { Category } from "@/types/auth";

export function AdminTaxonomyPage() {
  const { authedFetch, user } = useAuth();
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
        setError(err instanceof Error ? err.message : "Failed to load categories.");
      }
    } finally {
      if (!cancelled()) setLoading(false);
    }
  }, [authedFetch]);

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
      setNotice("Only SUPERADMIN can create extra categories.");
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
      setNotice("Category created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <Eyebrow className="eyebrow-cyan">Taxonomy</Eyebrow>
          <h1>Categories and tags</h1>
          <p>Main categories are protected. Tags are derived from mocked articles for now.</p>
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
              <h2 id="categories-title">Categories</h2>
              <p>Main: dev, ai, gaming. Extras can appear in the nav dropdown later.</p>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-empty">Loading categories...</div>
          ) : (
            <div className="taxonomy-list">
              {categories.map((category) => (
                <article className="taxonomy-item" key={category.slug}>
                  <div>
                    <strong>{category.label}</strong>
                    <p className="taxonomy-meta">
                      /category/{category.slug} - position {category.position}
                    </p>
                  </div>
                  <div className="taxonomy-actions">
                    <span className={category.isMain ? "status-pill status-published" : "status-pill status-draft"}>
                      {category.isMain ? "Main" : "Extra"}
                    </span>
                    {category.isMain ? (
                      <>
                        <button disabled type="button">
                          Edit
                        </button>
                        <button disabled type="button">
                          Delete
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
              <h2 id="new-category-title">Add extra category</h2>
              <p>Available only for SUPERADMIN accounts.</p>
            </div>
          </div>

          <form className="taxonomy-form" onSubmit={onCreate}>
            <label className="admin-field">
              <span>Label</span>
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
              <span>Slug</span>
              <input
                disabled={!isSuperadmin}
                onChange={(event) => setSlug(event.target.value)}
                required
                value={slug}
              />
            </label>
            <label className="admin-field">
              <span>Position</span>
              <input
                disabled={!isSuperadmin}
                min="0"
                onChange={(event) => setPosition(event.target.value)}
                placeholder="Optional"
                type="number"
                value={position}
              />
            </label>
            <button className="admin-cta" disabled={!isSuperadmin || submitting} type="submit">
              {submitting ? "Creating" : "Create category"}
            </button>
          </form>
        </section>

        <section className="admin-card taxonomy-tags" aria-labelledby="tags-title">
          <h2 id="tags-title">Tags from mock articles</h2>
          <p>These will move to backend data once public pages stop using mocks.</p>
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
