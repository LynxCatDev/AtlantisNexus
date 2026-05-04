import { useTranslations } from "next-intl";

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
  const t = useTranslations("categoryPage");
  const tCat = useTranslations("categories");
  const localizedCategory = tCat(category);

  return (
    <div className="app-frame">
      <Header activeLabel={category} />
      <main className="category-page__main">
        <section className="category-page__hero" aria-labelledby="category-title">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 id="category-title">
            {t("titleStart")} <span>{localizedCategory}</span>
          </h1>
          <p>{t("stories", { count: articles.length })}</p>
          <FilterRow aria-label={t("filtersAriaLabel")}>
            {articleCategories.map((filterCategory) => (
              <FilterPill
                active={filterCategory === category}
                aria-current={filterCategory === category ? "page" : undefined}
                href={getArticleCategoryHref(filterCategory)}
                key={filterCategory}
              >
                {tCat(filterCategory)}
              </FilterPill>
            ))}
          </FilterRow>
        </section>

        {articles.length > 0 ? (
          <ArticleGrid
            as="section"
            className="category-page__grid"
            aria-label={t("gridAriaLabel", { category: localizedCategory })}
          >
            {articles.map((article, index) => (
              <ArticleCard article={article} eager={index < 3} key={article.slug} />
            ))}
          </ArticleGrid>
        ) : (
          <EmptyPanel>
            <h2>{t("emptyTitle", { category: localizedCategory })}</h2>
            <p>{t("emptyCopy")}</p>
          </EmptyPanel>
        )}
      </main>
      <Footer />
    </div>
  );
}
