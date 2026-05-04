import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Button } from "@/components/Button/Button";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import type { ArticleDetail } from "@/types/content";

import "./ArticleDetailPage.scss";

type ArticleDetailPageProps = {
  detail: ArticleDetail;
};

export function ArticleDetailPage({ detail }: ArticleDetailPageProps) {
  const { article } = detail;

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
              <Eyebrow>{article.category}</Eyebrow>
              <h1 id="article-title">{article.title}</h1>
              <p>{article.excerpt}</p>
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
                  <button type="button">Save</button>
                  <button type="button">Share</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="article-detail__layout">
          <article className="article-detail__content">
            {detail.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.quote ? <blockquote>{section.quote}</blockquote> : null}
              </section>
            ))}

            <div className="article-detail__tags" aria-label="Article tags">
              {detail.tags.map((tag) => (
                <Link href={`/tag/${tag}`} key={tag}>
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="article-detail__reactions" aria-label="Article reactions">
              <button type="button">Heart {detail.reactions.likes}</button>
              <button type="button">{detail.reactions.comments} comments</button>
            </div>

            <section className="article-detail__comments" aria-labelledby="comments-title">
              <h2 id="comments-title">Comments</h2>
              <form className="article-detail__comment-form">
                <textarea aria-label="Comment" placeholder="Share your thoughts..." />
                <Button type="submit">Post comment</Button>
              </form>

              <div className="article-detail__comment-list">
                {detail.comments.map((comment) => (
                  <article
                    className="article-detail__comment"
                    key={`${comment.author}-${comment.postedAt}`}
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

          <aside className="article-detail__sidebar" aria-label="Article sidebar">
            <section className="article-detail__side-card">
              <Eyebrow>On this page</Eyebrow>
              <nav>
                {detail.sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </section>

            <section className="article-detail__side-card">
              <Eyebrow>Newsletter</Eyebrow>
              <h2>Get the weekly digest.</h2>
              <form className="article-detail__side-newsletter">
                <input aria-label="Email address" placeholder="Email" type="email" />
                <Button type="submit">Subscribe</Button>
              </form>
            </section>
          </aside>
        </div>

        <section className="article-detail__keep-reading" aria-labelledby="keep-reading-title">
          <h2 id="keep-reading-title">Keep reading</h2>
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
