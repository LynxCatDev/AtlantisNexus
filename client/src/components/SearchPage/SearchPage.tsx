"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { ArticleGrid } from "@/components/ArticleGrid/ArticleGrid";
import { EmptyPanel } from "@/components/EmptyPanel/EmptyPanel";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import {
  ArrowUpRightIcon,
  BracesIcon,
  CalculatorIcon,
  ConvertIcon,
  FileTextIcon,
  HashIcon,
  ImageIcon,
  PaletteIcon,
  RegexIcon,
  SearchIcon,
} from "@/components/Icons/Icons";
import { articles } from "@/constants/articles";
import { toolCatalog } from "@/constants/tools";
import type { ToolIconName } from "@/types/content";

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

export function SearchPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return { articles: [], tools: [] };
    }

    return {
      articles: articles.filter((article) =>
        `${article.title} ${article.excerpt} ${article.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery),
      ),
      tools: toolCatalog.filter((tool) =>
        `${tool.title} ${tool.description} ${tool.category}`
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    };
  }, [normalizedQuery]);

  return (
    <div className="app-frame">
      <Header activeLabel="Articles" />
      <main className="search-page__main">
        <section className="search-page__hero" aria-labelledby="search-title">
          <Eyebrow>Search</Eyebrow>
          <h1 id="search-title">Find the useful thing.</h1>
          <label className="search-page__field">
            <SearchIcon />
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles, tools, tags..."
              type="search"
              value={query}
            />
          </label>
          {!normalizedQuery ? (
            <p className="search-page__hint">Try react, elden, ai, or compressor.</p>
          ) : null}
        </section>

        {normalizedQuery ? (
          <div className="search-page__results">
            <section aria-labelledby="search-articles-title">
              <h2 id="search-articles-title">Articles ({results.articles.length})</h2>
              {results.articles.length > 0 ? (
                <ArticleGrid className="search-page__grid">
                  {results.articles.map((article, index) => (
                    <ArticleCard article={article} eager={index < 3} key={article.slug} />
                  ))}
                </ArticleGrid>
              ) : (
                <EmptyPanel as="div" compact>
                  <p>No articles matched {query}.</p>
                </EmptyPanel>
              )}
            </section>

            <section aria-labelledby="search-tools-title">
              <h2 id="search-tools-title">Tools ({results.tools.length})</h2>
              {results.tools.length > 0 ? (
                <div className="tools-page__catalog search-page__grid">
                  {results.tools.map((tool) => (
                    <Link
                      aria-label={`Open ${tool.title}`}
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
                      <h3>{tool.title}</h3>
                      <p>{tool.description}</p>
                      <div className="tools-page__card-meta">
                        <span>{tool.category}</span>
                        <strong>{tool.metric}</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel as="div" compact>
                  <p>No tools matched {query}.</p>
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
