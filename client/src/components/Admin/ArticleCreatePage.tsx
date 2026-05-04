"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/Button/Button";
import type { ArticleLocale, Category } from "@/types/auth";

const LOCALE_LABELS: Record<ArticleLocale, string> = {
  en: "English",
  ru: "Русский",
  ro: "Română",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
};

const ALL_LOCALES: ArticleLocale[] = ["en", "ru", "ro", "es", "de", "fr"];

type SectionDraft = {
  title: string;
  body: string; // newline-separated paragraphs
};

type TranslationDraft = {
  title: string;
  excerpt: string;
  sections: SectionDraft[];
};

const emptyTranslation = (): TranslationDraft => ({
  title: "",
  excerpt: "",
  sections: [{ title: "", body: "" }],
});

export function ArticleCreatePage() {
  const router = useRouter();
  const { authedFetch } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [minutes, setMinutes] = useState("5 min");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");

  const [translations, setTranslations] = useState<Record<ArticleLocale, TranslationDraft>>({
    en: emptyTranslation(),
  } as Record<ArticleLocale, TranslationDraft>);
  const [activeLocale, setActiveLocale] = useState<ArticleLocale>("en");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authedFetch<Category[]>("/categories");
        if (cancelled) return;
        setCategories(data);
        if (data.length > 0) {
          setCategorySlug((current) => current || data[0].slug);
        }
      } catch (err) {
        if (cancelled) return;
        setCategoriesError(err instanceof Error ? err.message : "Failed to load categories.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authedFetch]);

  const activeLocales = useMemo(
    () => Object.keys(translations) as ArticleLocale[],
    [translations],
  );
  const availableLocales = ALL_LOCALES.filter((l) => !activeLocales.includes(l));

  const updateTranslation = (locale: ArticleLocale, patch: Partial<TranslationDraft>) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  };

  const updateSection = (locale: ArticleLocale, idx: number, patch: Partial<SectionDraft>) => {
    setTranslations((prev) => {
      const sections = prev[locale].sections.map((s, i) => (i === idx ? { ...s, ...patch } : s));
      return { ...prev, [locale]: { ...prev[locale], sections } };
    });
  };

  const addSection = (locale: ArticleLocale) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        sections: [...prev[locale].sections, { title: "", body: "" }],
      },
    }));
  };

  const removeSection = (locale: ArticleLocale, idx: number) => {
    setTranslations((prev) => {
      if (prev[locale].sections.length <= 1) return prev;
      const sections = prev[locale].sections.filter((_, i) => i !== idx);
      return { ...prev, [locale]: { ...prev[locale], sections } };
    });
  };

  const addLocale = (locale: ArticleLocale) => {
    if (translations[locale]) return;
    setTranslations((prev) => ({ ...prev, [locale]: emptyTranslation() }));
    setActiveLocale(locale);
  };

  const removeLocale = (locale: ArticleLocale) => {
    if (locale === "en") return;
    setTranslations((prev) => {
      const next = { ...prev };
      delete next[locale];
      return next;
    });
    setActiveLocale("en");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const payload = {
      slug: slug.trim(),
      categorySlug: categorySlug.trim(),
      minutes: minutes.trim(),
      image: image.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      translations: activeLocales.map((locale) => {
        const t = translations[locale];
        return {
          locale,
          title: t.title.trim(),
          excerpt: t.excerpt.trim(),
          sections: t.sections.map((s, idx) => ({
            id: slugify(s.title) || `section-${idx + 1}`,
            title: s.title.trim(),
            paragraphs: s.body
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean),
          })),
        };
      }),
    };

    setSubmitting(true);
    try {
      await authedFetch("/articles", { method: "POST", body: payload });
      router.push("/articles");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create article.");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-form-page">
      <header className="admin-page-head">
        <h1>New article</h1>
        <p>English is required. Add other locales as tabs — switch between them to edit.</p>
      </header>

      <form className="admin-form" onSubmit={onSubmit} noValidate>
        <fieldset className="admin-fieldset">
          <legend>Article basics</legend>

          <label className="admin-field">
            <span>Slug</span>
            <input
              required
              minLength={2}
              maxLength={160}
              placeholder="my-first-article"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>Category</span>
            <select
              required
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              <option value="" disabled>
                Select a category…
              </option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                  {cat.isMain ? "" : " (custom)"}
                </option>
              ))}
            </select>
            {categoriesError ? <small className="admin-error">{categoriesError}</small> : null}
          </label>

          <label className="admin-field">
            <span>Read time</span>
            <input
              required
              maxLength={16}
              placeholder="6 min"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>Cover image URL</span>
            <input
              required
              type="url"
              maxLength={2048}
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>Tags (comma-separated)</span>
            <input
              maxLength={400}
              placeholder="ai, tooling, react"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>Translations</legend>

          <div className="lang-tabs" role="tablist" aria-label="Article locale">
            {activeLocales.map((locale) => (
              <button
                key={locale}
                type="button"
                role="tab"
                aria-selected={activeLocale === locale}
                className={`lang-tab${activeLocale === locale ? " active" : ""}`}
                onClick={() => setActiveLocale(locale)}
              >
                <span className="lang-tab-code">{locale.toUpperCase()}</span>
                <span className="lang-tab-label">{LOCALE_LABELS[locale]}</span>
                {locale !== "en" ? (
                  <span
                    className="lang-tab-remove"
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${LOCALE_LABELS[locale]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLocale(locale);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        removeLocale(locale);
                      }
                    }}
                  >
                    ×
                  </span>
                ) : (
                  <span className="lang-tab-required" aria-label="Required">
                    ●
                  </span>
                )}
              </button>
            ))}

            {availableLocales.length > 0 ? (
              <div className="lang-add">
                <span>Add:</span>
                {availableLocales.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    className="lang-add-btn"
                    onClick={() => addLocale(locale)}
                  >
                    + {locale.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <TranslationEditor
            key={activeLocale}
            locale={activeLocale}
            value={translations[activeLocale]}
            onChange={(patch) => updateTranslation(activeLocale, patch)}
            onSectionChange={(idx, patch) => updateSection(activeLocale, idx, patch)}
            onAddSection={() => addSection(activeLocale)}
            onRemoveSection={(idx) => removeSection(activeLocale, idx)}
          />
        </fieldset>

        {submitError ? <p className="admin-error">{submitError}</p> : null}

        <div className="admin-form-actions">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Publishing…" : "Publish article"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TranslationEditor({
  locale,
  value,
  onChange,
  onSectionChange,
  onAddSection,
  onRemoveSection,
}: {
  locale: ArticleLocale;
  value: TranslationDraft;
  onChange: (patch: Partial<TranslationDraft>) => void;
  onSectionChange: (idx: number, patch: Partial<SectionDraft>) => void;
  onAddSection: () => void;
  onRemoveSection: (idx: number) => void;
}) {
  return (
    <div className="lang-panel" role="tabpanel" aria-label={LOCALE_LABELS[locale]}>
      <label className="admin-field">
        <span>Title ({locale.toUpperCase()})</span>
        <input
          required
          minLength={2}
          maxLength={200}
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>

      <label className="admin-field">
        <span>Excerpt ({locale.toUpperCase()})</span>
        <textarea
          required
          maxLength={500}
          rows={3}
          value={value.excerpt}
          onChange={(e) => onChange({ excerpt: e.target.value })}
        />
      </label>

      <div className="section-list">
        <div className="section-list-head">
          <h3>Sections</h3>
          <button type="button" className="link-button" onClick={onAddSection}>
            + Add section
          </button>
        </div>

        {value.sections.map((section, idx) => (
          <div className="section-item" key={idx}>
            <div className="section-item-head">
              <strong>Section {idx + 1}</strong>
              {value.sections.length > 1 ? (
                <button
                  type="button"
                  className="link-button danger"
                  onClick={() => onRemoveSection(idx)}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <label className="admin-field">
              <span>Section title</span>
              <input
                required
                maxLength={200}
                value={section.title}
                onChange={(e) => onSectionChange(idx, { title: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>Body (separate paragraphs with a blank line)</span>
              <textarea
                required
                rows={6}
                value={section.body}
                onChange={(e) => onSectionChange(idx, { body: e.target.value })}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
