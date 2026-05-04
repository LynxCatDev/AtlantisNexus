import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { ArticleGrid } from "@/components/ArticleGrid/ArticleGrid";
import { EmptyPanel } from "@/components/EmptyPanel/EmptyPanel";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { FilterPill, FilterRow } from "@/components/FilterRow/FilterRow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { articleCategories, getArticleCategoryHref } from "@/constants/articles";
import type { Article, ArticleCategory } from "@/types/content";

import "./CategoryPage.scss";

type CategoryPageProps = {
  articles: Article[];
  category: ArticleCategory;
};

export function CategoryPage({ articles, category }: CategoryPageProps) {
  return (
    <div className="app-frame">
      <Header activeLabel={category} />
      <main className="category-page__main">
        <section className="category-page__hero" aria-labelledby="category-title">
          <Eyebrow>Category</Eyebrow>
          <h1 id="category-title">
            Explore <span>{category}</span>
          </h1>
          <p>{articles.length} stories in this category.</p>
          <FilterRow aria-label="Article filters">
            {articleCategories.map((filterCategory) => (
              <FilterPill
                active={filterCategory === category}
                aria-current={filterCategory === category ? "page" : undefined}
                href={getArticleCategoryHref(filterCategory)}
                key={filterCategory}
              >
                {filterCategory}
              </FilterPill>
            ))}
          </FilterRow>
        </section>

        {articles.length > 0 ? (
          <ArticleGrid
            as="section"
            className="category-page__grid"
            aria-label={`${category} articles`}
          >
            {articles.map((article, index) => (
              <ArticleCard article={article} eager={index < 3} key={article.slug} />
            ))}
          </ArticleGrid>
        ) : (
          <EmptyPanel>
            <h2>No articles yet in {category}.</h2>
            <p>New stories will appear here when the category starts publishing.</p>
          </EmptyPanel>
        )}
      </main>
      <Footer />
    </div>
  );
}
