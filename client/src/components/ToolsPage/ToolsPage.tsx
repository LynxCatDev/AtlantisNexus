"use client";

import Link from "next/link";
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
  const [activeCategory, setActiveCategory] = useState<ToolFilter>("All");

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
          <Eyebrow>Tools</Eyebrow>
          <h1 id="tools-title">
            Free, fast, <span>no signup</span>.
          </h1>
          <p>
            A growing kit of utilities for everyday work. Built for the browser. Your
            data never leaves your device.
          </p>
        </section>

        <section aria-labelledby="tools-catalog-title">
          <h2 className="sr-only" id="tools-catalog-title">
            Tool catalogue
          </h2>
          <FilterRow className="tools-page__filter-row" aria-label="Tool filters">
            {toolCategories.map((category) => (
              <FilterPill
                active={category === activeCategory}
                aria-pressed={category === activeCategory}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </FilterPill>
            ))}
          </FilterRow>

          <div className="tools-page__catalog">
            {filteredTools.map((tool) => (
              <Link
                aria-label={`Open ${tool.title}`}
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
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div className="tools-page__card-meta">
                  <span>{tool.category}</span>
                  <strong>{tool.metric}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
