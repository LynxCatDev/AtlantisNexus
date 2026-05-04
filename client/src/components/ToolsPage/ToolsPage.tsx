"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { FilterPill, FilterRow } from "@/components/FilterRow/FilterRow";
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
} from "@/components/Icons/Icons";
import { toolCatalog, toolCategories } from "@/constants/tools";
import { useToolContent } from "@/i18n/content";
import type { ToolCategory, ToolIconName } from "@/types/content";

import "./ToolsPage.scss";

type ToolFilter = ToolCategory | "All";

function ToolIcon({ name }: { name: ToolIconName }) {
  if (name === "image") {
    return <ImageIcon />;
  }

  if (name === "palette") {
    return <PaletteIcon />;
  }

  if (name === "calculator") {
    return <CalculatorIcon />;
  }

  if (name === "braces") {
    return <BracesIcon />;
  }

  if (name === "hash") {
    return <HashIcon />;
  }

  if (name === "file") {
    return <FileTextIcon />;
  }

  if (name === "convert") {
    return <ConvertIcon />;
  }

  return <RegexIcon />;
}

export function ToolsPage() {
  const t = useTranslations("toolsPage");
  const tCat = useTranslations("toolCategories");
  const tContent = useTranslations("content");
  const tc = useToolContent();
  const [activeCategory, setActiveCategory] = useState<ToolFilter>("All");
  const localizedMetric = (value: string) => value.replace(/uses/i, tContent("usesSuffix"));

  const filteredTools = useMemo(() => {
    if (activeCategory === "All") {
      return toolCatalog;
    }

    return toolCatalog.filter((tool) => tool.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="app-frame tools-page">
      <Header activeLabel="Tools" />
      <main className="tools-page__main">
        <section className="tools-page__hero" aria-labelledby="tools-title">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 id="tools-title">
            {t("titleStart")} <span>{t("titleAccent")}</span>
            {t("titleEnd")}
          </h1>
          <p>{t("lede")}</p>
        </section>

        <section aria-labelledby="tools-catalog-title">
          <h2 className="sr-only" id="tools-catalog-title">
            {t("catalogTitle")}
          </h2>
          <FilterRow className="tools-page__filter-row" aria-label={t("filtersAriaLabel")}>
            {toolCategories.map((category) => (
              <FilterPill
                active={category === activeCategory}
                aria-pressed={category === activeCategory}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {tCat(category)}
              </FilterPill>
            ))}
          </FilterRow>

          <div className="tools-page__catalog">
            {filteredTools.map((tool) => {
              const title = tc.title(tool.slug, tool.title);
              return (
                <Link
                  aria-label={t("openTool", { title })}
                  className="tools-page__card"
                  href={`/tools/${tool.slug}`}
                  id={tool.slug}
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
                    <span>{tCat(tool.category)}</span>
                    <strong>{localizedMetric(tool.metric)}</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
