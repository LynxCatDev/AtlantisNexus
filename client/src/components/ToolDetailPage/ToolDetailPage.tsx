import Link from "next/link";

import { Button } from "@/components/Button/Button";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { ArrowRightIcon } from "@/components/Icons/Icons";
import type { ToolCatalogItem } from "@/types/content";

import "./ToolDetailPage.scss";

type ToolDetailPageProps = {
  tool: ToolCatalogItem;
};

export function ToolDetailPage({ tool }: ToolDetailPageProps) {
  return (
    <div className="app-frame">
      <Header activeLabel="Tools" />
      <main className="tool-detail__main">
        <Link className="tool-detail__back" href="/tools">
          Back to tools
        </Link>
        <section className="tool-detail__panel" aria-labelledby="tool-title">
          <Eyebrow>{tool.category}</Eyebrow>
          <h1 id="tool-title">{tool.title}</h1>
          <p>{tool.description}</p>
          <div className="tool-detail__actions">
            <Button type="button">
              Launch tool
              <ArrowRightIcon />
            </Button>
            <span>{tool.metric}</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
