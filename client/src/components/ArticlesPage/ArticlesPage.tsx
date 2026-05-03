import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { articleCategories, articles, getArticleCategoryHref } from "@/constants/articles";
import type { ArticleCategory } from "@/types/content";

type ArticleFilter = ArticleCategory | "All";

type ArticlesPageProps = {
  activeCategory?: ArticleFilter;
};

export function ArticlesPage({ activeCategory = "All" }: ArticlesPageProps) {
  const filteredArticles =
    activeCategory === "All"
      ? articles
      : articles.filter((article) => article.category === activeCategory);
  const heading = activeCategory === "All" ? "The library" : `${activeCategory} articles`;
  const eyebrow = activeCategory === "All" ? "All articles" : activeCategory;

  return (
    <div className="app-frame">
      <Header activeLabel={activeCategory === "All" ? "Articles" : activeCategory} />
      <main className="home-main">
        <section className="library-hero" aria-labelledby="library-title">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="library-title">{heading}</h1>
          <p>Long reads, news and guides. Filter by topic to dive deeper.</p>
          <div className="filter-row" aria-label="Article filters">
            {articleCategories.map((category) => (
              <Link
                aria-current={category === activeCategory ? "page" : undefined}
                className={category === activeCategory ? "filter-pill active" : "filter-pill"}
                href={getArticleCategoryHref(category)}
                key={category}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        <section className="article-grid" id="articles" aria-label="Latest articles">
          {filteredArticles.map((article, index) => (
            <ArticleCard article={article} eager={index < 3} key={article.title} />
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
