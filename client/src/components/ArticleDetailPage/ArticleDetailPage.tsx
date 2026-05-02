import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import type { ArticleDetail } from "@/types/content";

type ArticleDetailPageProps = {
  detail: ArticleDetail;
};

export function ArticleDetailPage({ detail }: ArticleDetailPageProps) {
  const { article } = detail;

  return (
    <div className="app-frame article-page">
      <Header activeLabel="Articles" />
      <main>
        <section className="article-hero" aria-labelledby="article-title">
          <div className="article-hero-media">
            <Image
              alt={article.title}
              fill
              priority
              sizes="100vw"
              src={article.image}
            />
            <div className="article-hero-overlay" />
          </div>
          <div className="article-hero-content">
            <div className="article-hero-copy">
              <p className="eyebrow">{article.category}</p>
              <h1 id="article-title">{article.title}</h1>
              <p>{article.excerpt}</p>
              <div className="article-hero-footer">
                <div className="author-row">
                  <span className="avatar">{initials(article.author)}</span>
                  <div>
                    <strong>{article.author}</strong>
                    <span>
                      {article.publishedAt}
                      <span aria-hidden="true"> &middot; </span>
                      {article.minutes}
                    </span>
                  </div>
                </div>
                <div className="article-actions">
                  <button type="button">Save</button>
                  <button type="button">Share</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="article-layout">
          <article className="article-content">
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

            <div className="article-tags" aria-label="Article tags">
              {detail.tags.map((tag) => (
                <Link href="/articles" key={tag}>
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="reaction-row" aria-label="Article reactions">
              <button type="button">Heart {detail.reactions.likes}</button>
              <button type="button">{detail.reactions.comments} comments</button>
            </div>

            <section className="comments-section" aria-labelledby="comments-title">
              <h2 id="comments-title">Comments</h2>
              <form className="comment-form">
                <textarea aria-label="Comment" placeholder="Share your thoughts..." />
                <button className="button" type="submit">
                  Post comment
                </button>
              </form>

              <div className="comment-list">
                {detail.comments.map((comment) => (
                  <article className="comment-card" key={`${comment.author}-${comment.postedAt}`}>
                    <span className="avatar">{comment.initials}</span>
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

          <aside className="article-sidebar" aria-label="Article sidebar">
            <section className="article-side-card">
              <p className="eyebrow">On this page</p>
              <nav>
                {detail.sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </section>

            <section className="article-side-card">
              <p className="eyebrow">Newsletter</p>
              <h2>Get the weekly digest.</h2>
              <form className="side-newsletter-form">
                <input aria-label="Email address" placeholder="Email" type="email" />
                <button className="button" type="submit">
                  Subscribe
                </button>
              </form>
            </section>
          </aside>
        </div>

        <section className="keep-reading" aria-labelledby="keep-reading-title">
          <h2 id="keep-reading-title">Keep reading</h2>
          <div className="compact-article-grid">
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
