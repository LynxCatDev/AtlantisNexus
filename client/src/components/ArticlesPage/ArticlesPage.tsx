import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { articleCategories, articles } from "@/constants/articles";

export function ArticlesPage() {
  return (
    <div className="app-frame">
      <Header activeLabel="Articles" />
      <main className="home-main">
        <section className="library-hero" aria-labelledby="library-title">
          <p className="eyebrow">All articles</p>
          <h1 id="library-title">The library</h1>
          <p>Long reads, news and guides. Filter by topic to dive deeper.</p>
          <div className="filter-row" aria-label="Article filters">
            {articleCategories.map((category) => (
              <button
                className={category === "All" ? "filter-pill active" : "filter-pill"}
                key={category}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="article-grid" id="articles" aria-label="Latest articles">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.title} />
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
