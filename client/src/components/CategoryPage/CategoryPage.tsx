import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { articleCategories, getArticleCategoryHref } from "@/constants/articles";
import type { Article, ArticleCategory } from "@/types/content";

type CategoryPageProps = {
  articles: Article[];
  category: ArticleCategory;
};

export function CategoryPage({ articles, category }: CategoryPageProps) {
  return (
    <div className="app-frame">
      <Header activeLabel={category} />
      <main className="category-main">
        <section className="category-hero" aria-labelledby="category-title">
          <p className="eyebrow">Category</p>
          <h1 id="category-title">
            Explore <span>{category}</span>
          </h1>
          <p>{articles.length} stories in this category.</p>
          <div className="filter-row" aria-label="Article filters">
            {articleCategories.map((filterCategory) => (
              <Link
                aria-current={filterCategory === category ? "page" : undefined}
                className={filterCategory === category ? "filter-pill active" : "filter-pill"}
                href={getArticleCategoryHref(filterCategory)}
                key={filterCategory}
              >
                {filterCategory}
              </Link>
            ))}
          </div>
        </section>

        {articles.length > 0 ? (
          <section className="article-grid category-grid" aria-label={`${category} articles`}>
            {articles.map((article, index) => (
              <ArticleCard article={article} eager={index < 3} key={article.slug} />
            ))}
          </section>
        ) : (
          <section className="empty-panel">
            <h2>No articles yet in {category}.</h2>
            <p>New stories will appear here when the category starts publishing.</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
