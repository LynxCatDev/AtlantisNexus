import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Button } from "@/components/Button/Button";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { useArticleContent } from "@/i18n/content";
import type { ArticleDetail } from "@/types/content";

import "./ArticleDetailPage.scss";

type ArticleDetailPageProps = {
  detail: ArticleDetail;
};

export function ArticleDetailPage({ detail }: ArticleDetailPageProps) {
  const t = useTranslations("articleDetail");
  const tCat = useTranslations("categories");
  const tSection = useTranslations("content.sectionTitles");
  const tElden = useTranslations("content.eldenDetail");
  const tGeneric = useTranslations("content.genericDetail");
  const tComments = useTranslations("content.comments");
  const ac = useArticleContent();
  const { article } = detail;
  const localizedTitle = ac.title(article.slug, article.title);
  const localizedExcerpt = ac.excerpt(article.slug, article.excerpt);
  const isElden = article.slug === "elden-ring-nightreign-co-op-souls-era";

  type LocalSection = {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    quote?: string;
  };

  const sectionTitleKeyMap: Record<string, "introduction" | "keyTakeaways" | "deepDive" | "verdict"> = {
    introduction: "introduction",
    "key-takeaways": "keyTakeaways",
    "deep-dive": "deepDive",
    verdict: "verdict",
  };

  const localizedSections: LocalSection[] = detail.sections.map((section) => {
    const titleKey = sectionTitleKeyMap[section.id];
    const localTitle = titleKey ? tSection(titleKey) : section.title;
    if (isElden) {
      if (section.id === "introduction") {
        return { id: section.id, title: localTitle, paragraphs: [tElden("intro")] };
      }
      if (section.id === "key-takeaways") {
        return {
          id: section.id,
          title: localTitle,
          bullets: [tElden("bullet1"), tElden("bullet2"), tElden("bullet3")],
        };
      }
      if (section.id === "deep-dive") {
        return {
          id: section.id,
          title: localTitle,
          paragraphs: [tElden("deep1"), tElden("deep2")],
          quote: tElden("quote"),
        };
      }
      if (section.id === "verdict") {
        return { id: section.id, title: localTitle, paragraphs: [tElden("verdict")] };
      }
    } else {
      if (section.id === "introduction") {
        return {
          id: section.id,
          title: localTitle,
          paragraphs: [tGeneric("intro", { title: localizedTitle })],
        };
      }
      if (section.id === "key-takeaways") {
        return {
          id: section.id,
          title: localTitle,
          bullets: [tGeneric("bullet1"), tGeneric("bullet2"), tGeneric("bullet3")],
        };
      }
      if (section.id === "deep-dive") {
        return {
          id: section.id,
          title: localTitle,
          paragraphs: [localizedExcerpt, tGeneric("deep1Suffix")],
          quote: tGeneric("quote"),
        };
      }
      if (section.id === "verdict") {
        return { id: section.id, title: localTitle, paragraphs: [tGeneric("verdict")] };
      }
    }
    return {
      id: section.id,
      title: localTitle,
      paragraphs: section.paragraphs,
      bullets: section.bullets,
      quote: section.quote,
    };
  });

  const commentSet = isElden ? "elden" : "default";
  const localizedComments = (tComments.raw(commentSet) as Array<{ author: string; postedAt: string; body: string }>).map(
    (raw, index) => ({
      author: raw.author,
      postedAt: raw.postedAt,
      body: raw.body,
      initials: detail.comments[index]?.initials ?? raw.author.slice(0, 2).toUpperCase(),
    }),
  );

  return (
    <div className="app-frame article-detail">
      <Header activeLabel="Articles" />
      <main>
        <section className="article-detail__hero" aria-labelledby="article-title">
          <div className="article-detail__hero-media">
            <Image
              alt={article.title}
              fill
              priority
              sizes="100vw"
              src={article.image}
            />
            <div className="article-detail__hero-overlay" />
          </div>
          <div className="article-detail__hero-content">
            <div className="article-detail__hero-copy">
              <Eyebrow>{tCat(article.category)}</Eyebrow>
              <h1 id="article-title">{localizedTitle}</h1>
              <p>{localizedExcerpt}</p>
              <div className="article-detail__hero-footer">
                <div className="article-detail__author">
                  <span className="article-detail__avatar">{initials(article.author)}</span>
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
                  <button type="button">{t("save")}</button>
                  <button type="button">{t("share")}</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="article-detail__layout">
          <article className="article-detail__content">
            {localizedSections.map((section) => (
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

            <div className="article-detail__reactions" aria-label={t("reactionsAriaLabel")}>
              <button type="button">
                {t("heart")} {detail.reactions.likes}
              </button>
              <button type="button">{t("comments", { count: detail.reactions.comments })}</button>
            </div>

            <section className="article-detail__comments" aria-labelledby="comments-title">
              <h2 id="comments-title">{t("commentsHeading")}</h2>
              <form className="article-detail__comment-form">
                <textarea
                  aria-label={t("commentAriaLabel")}
                  placeholder={t("commentPlaceholder")}
                />
                <Button type="submit">{t("postComment")}</Button>
              </form>

              <div className="article-detail__comment-list">
                {localizedComments.map((comment, idx) => (
                  <article
                    className="article-detail__comment"
                    key={`comment-${idx}`}
                  >
                    <span className="article-detail__avatar">{comment.initials}</span>
                    <div>
                      <p>
                        <strong>{comment.author}</strong>
                        <span>{comment.postedAt}</span>
                      </p>
                      <p>{comment.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </article>

          <aside className="article-detail__sidebar" aria-label={t("sidebarAriaLabel")}>
            <section className="article-detail__side-card">
              <Eyebrow>{t("onThisPage")}</Eyebrow>
              <nav>
                {localizedSections.map((section) => (
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
