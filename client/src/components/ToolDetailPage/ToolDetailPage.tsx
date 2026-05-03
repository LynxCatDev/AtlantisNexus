import Link from "next/link";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { ArrowRightIcon } from "@/components/Icons/Icons";
import type { ToolCatalogItem } from "@/types/content";

type ToolDetailPageProps = {
  tool: ToolCatalogItem;
};

export function ToolDetailPage({ tool }: ToolDetailPageProps) {
  return (
    <div className="app-frame tools-page">
      <Header activeLabel="Tools" />
      <main className="tool-detail-main">
        <Link className="tool-back-link" href="/tools">
          Back to tools
        </Link>
        <section className="tool-detail-panel" aria-labelledby="tool-title">
          <p className="eyebrow">{tool.category}</p>
          <h1 id="tool-title">{tool.title}</h1>
          <p>{tool.description}</p>
          <div className="tool-detail-actions">
            <button className="button" type="button">
              Launch tool
              <ArrowRightIcon />
            </button>
            <span>{tool.metric}</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
