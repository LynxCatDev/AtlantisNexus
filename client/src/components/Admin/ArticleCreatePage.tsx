"use client";

import {
  Plus as PlusIcon,
  RefreshCcw as RefreshCcwIcon,
  Trash2 as Trash2Icon,
  Upload as UploadIcon,
  X as XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/Button/Button";
import { ApiError, apiBaseUrl } from "@/lib/api";
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

type EditArticleResponse = {
  slug: string;
  categorySlug: string;
  minutes: string;
  image: string;
  tags: string[];
  translations: Array<{
    locale: ArticleLocale;
    title: string;
    excerpt: string;
    sections: Array<{ id?: string; title: string; paragraphs: string[] }>;
  }>;
};

const emptyTranslation = (): TranslationDraft => ({
  title: "",
  excerpt: "",
  sections: [{ title: "", body: "" }],
});

export function ArticleCreatePage({ editSlug }: { editSlug?: string } = {}) {
  const router = useRouter();
  const { authedFetch, accessToken } = useAuth();
  const t = useTranslations("admin");
  const isEdit = Boolean(editSlug);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [minutes, setMinutes] = useState("5 min");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [translations, setTranslations] = useState<Record<ArticleLocale, TranslationDraft>>({
    en: emptyTranslation(),
  } as Record<ArticleLocale, TranslationDraft>);
  const [activeLocale, setActiveLocale] = useState<ArticleLocale>("en");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authedFetch<Category[]>("/categories");
        if (cancelled) return;
        setCategories(data);
        if (data.length > 0 && !isEdit) {
          setCategorySlug((current) => current || data[0].slug);
        }
      } catch (err) {
        if (cancelled) return;
        setCategoriesError(err instanceof Error ? err.message : t("formCategoryError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authedFetch, isEdit, t]);

  useEffect(() => {
    if (!editSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await authedFetch<EditArticleResponse>(
          `/articles/${encodeURIComponent(editSlug)}/edit`,
        );
        if (cancelled) return;
        setSlug(data.slug);
        setCategorySlug(data.categorySlug);
        setMinutes(data.minutes);
        setImage(data.image);
        setTags(data.tags.join(", "));

        const next: Record<ArticleLocale, TranslationDraft> = {} as Record<
          ArticleLocale,
          TranslationDraft
        >;
        for (const tr of data.translations) {
          next[tr.locale] = {
            title: tr.title,
            excerpt: tr.excerpt,
            sections:
              tr.sections.length > 0
                ? tr.sections.map((s) => ({
                    title: s.title,
                    body: s.paragraphs.join("\n\n"),
                  }))
                : [{ title: "", body: "" }],
          };
        }
        if (!next.en) next.en = emptyTranslation();
        setTranslations(next);
        setActiveLocale("en");
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : t("formLoadFailed"));
      } finally {
        if (!cancelled) setLoadingArticle(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editSlug, authedFetch, t]);

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

  useEffect(() => {
    if (!pendingPreview) return;
    return () => URL.revokeObjectURL(pendingPreview);
  }, [pendingPreview]);

  const onCoverFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > 8 * 1024 * 1024) {
      setUploadError(t("formCoverTooLarge"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError(t("formCoverWrongType"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setImage("");
  };

  const clearCover = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setImage("");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPendingCover = async (): Promise<string> => {
    if (!pendingFile) throw new Error("No file selected");
    const form = new FormData();
    form.append("file", pendingFile);
    const res = await fetch(`${apiBaseUrl}/articles/cover-image`, {
      method: "POST",
      body: form,
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message =
        (data && typeof data === "object" && "message" in data
          ? Array.isArray((data as { message: unknown }).message)
            ? ((data as { message: string[] }).message.join(", ") as string)
            : String((data as { message: unknown }).message)
          : res.statusText) || `Upload failed (${res.status})`;
      throw new ApiError(res.status, message, data);
    }
    const { url } = (await res.json()) as { url: string };
    return url;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!pendingFile && !image.trim()) {
      setSubmitError(t("formCoverRequired"));
      return;
    }

    setSubmitting(true);
    let finalImage = image.trim();
    if (pendingFile) {
      try {
        finalImage = await uploadPendingCover();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : t("formCoverUploadFailed"));
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      slug: slug.trim(),
      categorySlug: categorySlug.trim(),
      minutes: minutes.trim(),
      image: finalImage,
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

    try {
      if (isEdit && editSlug) {
        await authedFetch(`/articles/${encodeURIComponent(editSlug)}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await authedFetch("/articles", { method: "POST", body: payload });
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("formSubmitFailed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-form-page">
      <header className="admin-page-head">
        <h1>{isEdit ? t("formEditTitle") : t("formNewTitle")}</h1>
        <p>{t("formNewLede")}</p>
      </header>

      {loadingArticle ? (
        <p className="admin-notice" role="status">
          {t("formLoading")}
        </p>
      ) : null}
      {loadError ? (
        <p className="admin-error" role="alert">
          {loadError}
        </p>
      ) : null}

      <form className="admin-form" onSubmit={onSubmit} noValidate>
        <fieldset className="admin-fieldset">
          <legend>{t("formBasics")}</legend>

          <label className="admin-field">
            <span>{t("formSlug")}</span>
            <input
              required
              minLength={2}
              maxLength={160}
              placeholder={t("formSlugPlaceholder")}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>{t("formCategory")}</span>
            <select
              required
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              <option value="" disabled>
                {t("formCategoryPlaceholder")}
              </option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                  {cat.isMain ? "" : ` ${t("formCategoryCustom")}`}
                </option>
              ))}
            </select>
            {categoriesError ? <small className="admin-error">{categoriesError}</small> : null}
          </label>

          <label className="admin-field">
            <span>{t("formReadTime")}</span>
            <input
              required
              maxLength={16}
              placeholder={t("formReadTimePlaceholder")}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>

          <div className="admin-field">
            <span>{t("formCover")}</span>
            <div className="cover-upload">
              <div
                className={`cover-upload__preview${pendingPreview || image ? " has-image" : ""}`}
                aria-hidden={!(pendingPreview || image)}
              >
                {pendingPreview || image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pendingPreview ?? image} alt={t("formCoverPreviewAlt")} />
                ) : (
                  <span className="cover-upload__placeholder">{t("formCoverNoImage")}</span>
                )}
              </div>
              <div className="cover-upload__controls">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="cover-upload__file"
                  onChange={onCoverFileChange}
                />
                <div className="cover-upload__buttons">
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {pendingFile ? (
                      <RefreshCcwIcon aria-hidden="true" size={16} />
                    ) : (
                      <UploadIcon aria-hidden="true" size={16} />
                    )}
                    {pendingFile ? t("formCoverReplace") : t("formCoverUpload")}
                  </button>
                  {pendingFile || image ? (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={clearCover}
                    >
                      <XIcon aria-hidden="true" size={16} />
                      {t("formCoverClear")}
                    </button>
                  ) : null}
                </div>
                <input
                  type="url"
                  maxLength={2048}
                  placeholder={t("formCoverUrlPlaceholder")}
                  value={image}
                  disabled={!!pendingFile}
                  onChange={(e) => setImage(e.target.value)}
                />
                {uploadError ? <small className="admin-error">{uploadError}</small> : null}
              </div>
            </div>
          </div>

          <label className="admin-field">
            <span>{t("formTags")}</span>
            <input
              maxLength={400}
              placeholder={t("formTagsPlaceholder")}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>{t("formTranslations")}</legend>

          <div className="lang-tabs" role="tablist" aria-label={t("formLocaleAriaLabel")}>
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
                    aria-label={t("formLocaleRemove", { locale: LOCALE_LABELS[locale] })}
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
                    <XIcon aria-hidden="true" size={13} />
                  </span>
                ) : (
                  <span className="lang-tab-required" aria-label={t("formLocaleRequired")}>
                    ●
                  </span>
                )}
              </button>
            ))}

            {availableLocales.length > 0 ? (
              <div className="lang-add">
                <span>{t("formLocaleAdd")}</span>
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
          <Button
            type="submit"
            className="admin-publish-button"
            disabled={submitting || loadingArticle}
          >
            {submitting
              ? isEdit
                ? t("formUpdating")
                : t("formPublishing")
              : isEdit
                ? t("formUpdate")
                : t("formPublish")}
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
  const t = useTranslations("admin");
  return (
    <div className="lang-panel" role="tabpanel" aria-label={LOCALE_LABELS[locale]}>
      <label className="admin-field">
        <span>{t("formTitleLabel", { locale: locale.toUpperCase() })}</span>
        <input
          required
          minLength={2}
          maxLength={200}
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>

      <label className="admin-field">
        <span>{t("formExcerptLabel", { locale: locale.toUpperCase() })}</span>
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
          <h3>{t("formSections")}</h3>
          <button type="button" className="link-button" onClick={onAddSection}>
            <PlusIcon aria-hidden="true" size={16} />
            {t("formAddSection")}
          </button>
        </div>

        {value.sections.map((section, idx) => (
          <div className="section-item" key={idx}>
            <div className="section-item-head">
              <strong>{t("formSection", { n: idx + 1 })}</strong>
              {value.sections.length > 1 ? (
                <button
                  type="button"
                  className="link-button danger"
                  onClick={() => onRemoveSection(idx)}
                >
                  <Trash2Icon aria-hidden="true" size={16} />
                  {t("formRemoveSection")}
                </button>
              ) : null}
            </div>
            <label className="admin-field">
              <span>{t("formSectionTitle")}</span>
              <input
                required
                maxLength={200}
                value={section.title}
                onChange={(e) => onSectionChange(idx, { title: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>{t("formSectionBody")}</span>
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
