"use client";

import Link from "next/link";
import {
  ArrowUpRight as ArrowUpRightIcon,
  Braces as BracesIcon,
  Calculator as CalculatorIcon,
  FileText as FileTextIcon,
  Hash as HashIcon,
  Image as ImageIcon,
  Palette as PaletteIcon,
  Regex as RegexIcon,
  Repeat as ConvertIcon,
  Search as SearchIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { ArticleGrid } from "@/components/ArticleGrid/ArticleGrid";
import { EmptyPanel } from "@/components/EmptyPanel/EmptyPanel";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { toolCatalog } from "@/constants/tools";
import { useToolContent } from "@/i18n/content";
import type { Article, ToolIconName } from "@/types/content";

import "./SearchPage.scss";

function ToolIcon({ name }: { name: ToolIconName }) {
  if (name === "image") return <ImageIcon />;
  if (name === "palette") return <PaletteIcon />;
  if (name === "calculator") return <CalculatorIcon />;
  if (name === "braces") return <BracesIcon />;
  if (name === "hash") return <HashIcon />;
  if (name === "file") return <FileTextIcon />;
  if (name === "convert") return <ConvertIcon />;

  return <RegexIcon />;
}

type SearchPageProps = {
  articles: Article[];
};

export function SearchPage({ articles }: SearchPageProps) {
  const t = useTranslations("searchPage");
  const tToolCat = useTranslations("toolCategories");
  const tContent = useTranslations("content");
  const tc = useToolContent();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const localizedMetric = (value: string) => value.replace(/uses/i, tContent("usesSuffix"));

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return { articles: [], tools: [] };
    }

    return {
      articles: articles.filter((article) => {
        return `${article.title} ${article.excerpt} ${article.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
      tools: toolCatalog.filter((tool) => {
        const title = tc.title(tool.slug, tool.title);
        const description = tc.description(tool.slug, tool.description);
        return `${title} ${description} ${tool.title} ${tool.description} ${tool.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    };
  }, [articles, normalizedQuery, tc]);

  return (
    <div className="app-frame">
      <Header activeLabel="Articles" />
      <main className="search-page__main">
        <section className="search-page__hero" aria-labelledby="search-title">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 id="search-title">{t("title")}</h1>
          <label className="search-page__field">
            <SearchIcon />
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("placeholder")}
              type="search"
              value={query}
            />
          </label>
          {!normalizedQuery ? (
            <p className="search-page__hint">{t("hint")}</p>
          ) : null}
        </section>

        {normalizedQuery ? (
          <div className="search-page__results">
            <section aria-labelledby="search-articles-title">
              <h2 id="search-articles-title">
                {t("articlesHeading", { count: results.articles.length })}
              </h2>
              {results.articles.length > 0 ? (
                <ArticleGrid className="search-page__grid">
                  {results.articles.map((article, index) => (
                    <ArticleCard article={article} eager={index < 3} key={article.slug} />
                  ))}
                </ArticleGrid>
              ) : (
                <EmptyPanel as="div" compact>
                  <p>{t("noArticles", { query })}</p>
                </EmptyPanel>
              )}
            </section>

            <section aria-labelledby="search-tools-title">
              <h2 id="search-tools-title">
                {t("toolsHeading", { count: results.tools.length })}
              </h2>
              {results.tools.length > 0 ? (
                <div className="tools-page__catalog search-page__grid">
                  {results.tools.map((tool) => {
                    const title = tc.title(tool.slug, tool.title);
                    return (
                      <Link
                        aria-label={t("openTool", { title })}
                        className="tools-page__card"
                        href={`/tools/${tool.slug}`}
                        key={tool.slug}
                      >
                        <div className="tools-page__card-top">
                          <span className="tools-page__card-icon">
                            <ToolIcon name={tool.icon} />
                          </span>
                          <ArrowUpRightIcon className="tools-page__card-arrow" />
                        </div>
                        <h3>{title}</h3>
                        <p>{tc.description(tool.slug, tool.description)}</p>
                        <div className="tools-page__card-meta">
                          <span>{tToolCat(tool.category)}</span>
                          <strong>{localizedMetric(tool.metric)}</strong>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyPanel as="div" compact>
                  <p>{t("noTools", { query })}</p>
                </EmptyPanel>
              )}
            </section>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
