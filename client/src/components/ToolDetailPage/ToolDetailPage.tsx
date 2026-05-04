import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/Button/Button";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { ArrowRightIcon } from "@/components/Icons/Icons";
import { useToolContent } from "@/i18n/content";
import type { ToolCatalogItem } from "@/types/content";

import "./ToolDetailPage.scss";

type ToolDetailPageProps = {
  tool: ToolCatalogItem;
};

export function ToolDetailPage({ tool }: ToolDetailPageProps) {
  const t = useTranslations("toolDetail");
  const tCat = useTranslations("toolCategories");
  const tContent = useTranslations("content");
  const tc = useToolContent();
  const localizedMetric = tool.metric.replace(/uses/i, tContent("usesSuffix"));

  return (
    <div className="app-frame">
      <Header activeLabel="Tools" />
      <main className="tool-detail__main">
        <Link className="tool-detail__back" href="/tools">
          {t("back")}
        </Link>
        <section className="tool-detail__panel" aria-labelledby="tool-title">
          <Eyebrow>{tCat(tool.category)}</Eyebrow>
          <h1 id="tool-title">{tc.title(tool.slug, tool.title)}</h1>
          <p>{tc.description(tool.slug, tool.description)}</p>
          <div className="tool-detail__actions">
            <Button type="button">
              {t("launch")}
              <ArrowRightIcon />
            </Button>
            <span>{localizedMetric}</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
