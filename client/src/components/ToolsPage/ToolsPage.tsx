import Link from "next/link";

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
import type { ToolIconName } from "@/types/content";

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
  return (
    <div className="app-frame tools-page">
      <Header activeLabel="Tools" />
      <main className="tools-main">
        <section className="tools-hero" aria-labelledby="tools-title">
          <p className="eyebrow">Tools</p>
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
          <div className="filter-row tools-filter-row" aria-label="Tool filters">
            {toolCategories.map((category) => (
              <button
                className={category === "All" ? "filter-pill active" : "filter-pill"}
                key={category}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          <div className="tools-catalog-grid">
            {toolCatalog.map((tool) => (
              <Link
                aria-label={`Open ${tool.title}`}
                className="catalog-tool-card"
                href={`/tools/${tool.slug}`}
                id={tool.slug}
                key={tool.slug}
              >
                <div className="catalog-tool-top">
                  <span className="catalog-tool-icon">
                    <ToolIcon name={tool.icon} />
                  </span>
                  <ArrowUpRightIcon className="catalog-tool-arrow" />
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div className="catalog-tool-meta">
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
