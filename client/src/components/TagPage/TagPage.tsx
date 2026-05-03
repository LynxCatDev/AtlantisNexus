import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import type { Article } from "@/types/content";

type TagPageProps = {
  articles: Article[];
  tag: string;
};

export function TagPage({ articles, tag }: TagPageProps) {
  return (
    <div className="app-frame">
      <Header activeLabel="Articles" />
      <main className="category-main">
        <section className="category-hero" aria-labelledby="tag-title">
          <p className="eyebrow">Tag</p>
          <h1 id="tag-title">
            Browse <span>#{tag}</span>
          </h1>
          <p>{articles.length} stories tagged with #{tag}.</p>
        </section>

        {articles.length > 0 ? (
          <section className="article-grid category-grid" aria-label={`Articles tagged ${tag}`}>
            {articles.map((article, index) => (
              <ArticleCard article={article} eager={index < 3} key={article.slug} />
            ))}
          </section>
        ) : (
          <section className="empty-panel">
            <h2>No articles yet for #{tag}.</h2>
            <p>Try another topic or come back after the next editorial drop.</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
