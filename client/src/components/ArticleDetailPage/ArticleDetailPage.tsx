import Image from "next/image";
import Link from "next/link";
import {
  Bookmark as BookmarkIcon,
  MessageSquare as MessageSquareIcon,
  Share2 as Share2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Button } from "@/components/Button/Button";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import type { ArticleDetail } from "@/types/content";

import { CommentSection } from "./CommentSection";
import { ReactionBar } from "./ReactionBar";
import "./ArticleDetailPage.scss";

type ArticleDetailPageProps = {
  detail: ArticleDetail;
};

export function ArticleDetailPage({ detail }: ArticleDetailPageProps) {
  const t = useTranslations("articleDetail");
  const tCat = useTranslations("categories");
  const { article } = detail;

  return (
    <div className="app-frame article-detail">
      <Header activeLabel="Articles" />
      <main>
        <section className="article-detail__hero" aria-labelledby="article-title">
          <div className="article-detail__hero-glow" aria-hidden="true" />
          <div className="article-detail__hero-inner">
            <Eyebrow>{tCat(article.category)}</Eyebrow>
            <h1 id="article-title">{article.title}</h1>
            <p className="article-detail__lede">{article.excerpt}</p>
            <div className="article-detail__meta">
              <div className="article-detail__author">
                <span
                  aria-hidden="true"
                  className={`article-detail__avatar${article.authorAvatar ? " article-detail__avatar--image" : ""}`}
                  style={
                    article.authorAvatar ? { backgroundImage: `url(${article.authorAvatar})` } : undefined
                  }
                >
                  {article.authorAvatar ? null : initials(article.author)}
                </span>
                <div>
                  <strong>{article.author}</strong>
                  <span>
                    {article.publishedAt}
                    <span aria-hidden="true"> &middot; </span>
                    {article.minutes}
                  </span>
                </div>
              </div>
              <div className="article-detail__actions">
                <button type="button">
                  <BookmarkIcon aria-hidden="true" size={16} />
                  {t("save")}
                </button>
                <button type="button">
                  <Share2Icon aria-hidden="true" size={16} />
                  {t("share")}
                </button>
              </div>
            </div>
            {article.image ? (
              <figure className="article-detail__featured">
                <Image
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1168px"
                  src={article.image}
                />
              </figure>
            ) : null}
          </div>
        </section>

        <div className="article-detail__layout">
          <article className="article-detail__content">
            {detail.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph, idx) => (
                  <p key={`${section.id}-p-${idx}`}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet, idx) => (
                      <li key={`${section.id}-b-${idx}`}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.quote ? <blockquote>{section.quote}</blockquote> : null}
              </section>
            ))}

            <div className="article-detail__tags" aria-label={t("tagsAriaLabel")}>
              {detail.tags.map((tag) => (
                <Link href={`/tag/${tag}`} key={tag}>
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="article-detail__reaction-row">
              <ReactionBar slug={article.slug} initialCounts={{}} />
              <button type="button" className="article-detail__comment-count">
                <MessageSquareIcon aria-hidden="true" size={16} />
                {t("comments", { count: detail.reactions.comments })}
              </button>
            </div>

            <CommentSection slug={article.slug} />
          </article>

          <aside className="article-detail__sidebar" aria-label={t("sidebarAriaLabel")}>
            <section className="article-detail__side-card">
              <Eyebrow>{t("onThisPage")}</Eyebrow>
              <nav>
                {detail.sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </section>

            <section className="article-detail__side-card">
              <Eyebrow>{t("newsletterEyebrow")}</Eyebrow>
              <h2>{t("newsletterHeading")}</h2>
              <form className="article-detail__side-newsletter">
                <input
                  aria-label={t("emailAriaLabel")}
                  placeholder={t("emailPlaceholder")}
                  type="email"
                />
                <Button type="submit">{t("subscribe")}</Button>
              </form>
            </section>
          </aside>
        </div>

        <section className="article-detail__keep-reading" aria-labelledby="keep-reading-title">
          <h2 id="keep-reading-title">{t("keepReading")}</h2>
          <div className="article-detail__compact-grid">
            {detail.related.map((relatedArticle) => (
              <ArticleCard article={relatedArticle} key={relatedArticle.slug} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
