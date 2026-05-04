import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { ArticleGrid } from "@/components/ArticleGrid/ArticleGrid";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { FilterPill, FilterRow } from "@/components/FilterRow/FilterRow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { articleCategories, articles, getArticleCategoryHref } from "@/constants/articles";
import type { ArticleCategory } from "@/types/content";

import "./ArticlesPage.scss";

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
      <main className="articles-page__main">
        <section className="articles-page__hero" aria-labelledby="library-title">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="library-title">{heading}</h1>
          <p>Long reads, news and guides. Filter by topic to dive deeper.</p>
          <FilterRow aria-label="Article filters">
            {articleCategories.map((category) => (
              <FilterPill
                active={category === activeCategory}
                aria-current={category === activeCategory ? "page" : undefined}
                href={getArticleCategoryHref(category)}
                key={category}
              >
                {category}
              </FilterPill>
            ))}
          </FilterRow>
        </section>

        <ArticleGrid as="section" id="articles" aria-label="Latest articles">
          {filteredArticles.map((article, index) => (
            <ArticleCard article={article} eager={index < 3} key={article.title} />
          ))}
        </ArticleGrid>
      </main>
      <Footer />
    </div>
  );
}
