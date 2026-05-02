import Image from "next/image";

import type { Article } from "@/types/content";

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="article-card">
      <div className="article-image">
        <Image
          alt={article.title}
          fill
          sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
          src={article.image}
        />
        <span className={`tag tag-${article.category.toLowerCase()}`}>{article.category}</span>
      </div>
      <div className="article-body">
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
        <div className="article-meta">
          <strong>{article.author}</strong>
          <span aria-hidden="true">&middot;</span>
          <span>{article.minutes}</span>
        </div>
      </div>
    </article>
  );
}
