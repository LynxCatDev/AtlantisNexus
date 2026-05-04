import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { ArticleGrid } from "@/components/ArticleGrid/ArticleGrid";
import { EmptyPanel } from "@/components/EmptyPanel/EmptyPanel";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import type { Article } from "@/types/content";

import "./TagPage.scss";

type TagPageProps = {
  articles: Article[];
  tag: string;
};

export function TagPage({ articles, tag }: TagPageProps) {
  return (
    <div className="app-frame">
      <Header activeLabel="Articles" />
      <main className="tag-page__main">
        <section className="tag-page__hero" aria-labelledby="tag-title">
          <Eyebrow>Tag</Eyebrow>
          <h1 id="tag-title">
            Browse <span>#{tag}</span>
          </h1>
          <p>{articles.length} stories tagged with #{tag}.</p>
        </section>

        {articles.length > 0 ? (
          <ArticleGrid
            as="section"
            className="tag-page__grid"
            aria-label={`Articles tagged ${tag}`}
          >
            {articles.map((article, index) => (
              <ArticleCard article={article} eager={index < 3} key={article.slug} />
            ))}
          </ArticleGrid>
        ) : (
          <EmptyPanel>
            <h2>No articles yet for #{tag}.</h2>
            <p>Try another topic or come back after the next editorial drop.</p>
          </EmptyPanel>
        )}
      </main>
      <Footer />
    </div>
  );
}
