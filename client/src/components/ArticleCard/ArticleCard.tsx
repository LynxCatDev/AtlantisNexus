import Image from "next/image";
import Link from "next/link";

import { ClockIcon } from "@/components/Icons/Icons";
import type { Article } from "@/types/content";

import "./ArticleCard.scss";

type ArticleCardProps = {
  article: Article;
  eager?: boolean;
};

export function ArticleCard({ article, eager = false }: ArticleCardProps) {
  return (
    <Link className="article-card" href={`/article/${article.slug}`}>
      <article>
        <div className="article-card__image">
          <Image
            alt={article.title}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
            src={article.image}
          />
          <span
            className={`article-card__tag article-card__tag--${article.category.toLowerCase()}`}
          >
            {article.category}
          </span>
        </div>
        <div className="article-card__body">
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <div className="article-card__meta">
            <strong>{article.author}</strong>
            <span aria-hidden="true">&middot;</span>
            <span className="article-card__read-time">
              <ClockIcon />
              {article.minutes}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
