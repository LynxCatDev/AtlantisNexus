import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { ArticleGrid } from "@/components/ArticleGrid/ArticleGrid";
import { Button } from "@/components/Button/Button";
import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BrainIcon,
  BracesIcon,
  CalculatorIcon,
  CodeIcon,
  GamepadIcon,
  ImageIcon,
  PaletteIcon,
  SparkleIcon,
} from "@/components/Icons/Icons";
import { articles } from "@/constants/articles";
import { freeTools, heroMetrics, trendingTopics } from "@/constants/home";
import { useArticleContent, useToolContent } from "@/i18n/content";
import type { ArticleCategory } from "@/types/content";

const HERO_METRIC_KEYS: Record<string, "articles" | "freeTools" | "monthlyReaders"> = {
  Articles: "articles",
  "Free tools": "freeTools",
  "Monthly readers": "monthlyReaders",
};

const TOOL_TYPE_KEYS: Record<string, "Calculators" | "Media" | "Developer" | "AI"> = {
  Calculators: "Calculators",
  Media: "Media",
  Developer: "Developer",
  AI: "AI",
};

const TRENDING_KEYS: Record<string, "llmAgents" | "mediaCareers" | "promptEngineering" | "edgeRuntimes" | "indieDev"> = {
  "LLM Agents": "llmAgents",
  "Media Careers": "mediaCareers",
  "Prompt Engineering": "promptEngineering",
  "Edge Runtimes": "edgeRuntimes",
  "Indie Dev": "indieDev",
};

import "./HomePage.scss";

function FeatureIcon({ category }: { category: ArticleCategory }) {
  if (category === "Gaming") return <GamepadIcon />;
  if (category === "AI") return <BrainIcon />;
  return <CodeIcon />;
}

function HomeToolIcon({ slug }: { slug: string }) {
  if (slug === "image-compressor") return <ImageIcon />;
  if (slug === "color-converter") return <PaletteIcon />;
  if (slug === "percentage-calculator") return <CalculatorIcon />;
  return <BracesIcon />;
}

export function HomePage() {
  const t = useTranslations("home");
  const tCat = useTranslations("categories");
  const tToolCat = useTranslations("toolCategories");
  const tMetrics = useTranslations("content.metrics");
  const tTrending = useTranslations("content.trendingTopics");
  const tContent = useTranslations("content");
  const ac = useArticleContent();
  const tc = useToolContent();
  const featured = articles[0];
  const sidePicks = articles.slice(1, 4);
  const gamingArticles = articles.filter((a) => a.category === "Gaming").slice(0, 3);
  const aiDevArticles = articles.filter((a) => a.category !== "Gaming").slice(0, 3);

  const localizedMetric = (label: string) => {
    const key = HERO_METRIC_KEYS[label];
    return key ? tMetrics(key) : label;
  };

  const localizedMetricValue = (value: string) =>
    value.replace(/uses/i, tContent("usesSuffix"));

  const localizedTopic = (topic: string) => {
    const key = TRENDING_KEYS[topic];
    return key ? tTrending(key) : topic;
  };

  const heroPillars: Array<{
    tone: ArticleCategory;
    title: string;
    description: string;
  }> = [
    { tone: "Gaming", title: tCat("Gaming"), description: t("pillarGamingDescription") },
    { tone: "AI", title: tCat("AI"), description: t("pillarAiDescription") },
    { tone: "Dev", title: tCat("Dev"), description: t("pillarDevDescription") },
  ];

  return (
    <div className="app-frame home">
      <Header />
      <main className="home__main">
        <section className="home__hero" aria-labelledby="home-title">
          <p className="home__release-pill">
            <SparkleIcon />
            <span>{t("releasePill")}</span>
          </p>
          <h1 id="home-title">
            {t("title")} <span>{t("titleAccent")}</span> {t("titleEnd")}
          </h1>
          <p>{t("lede")}</p>
          <div className="home__hero-actions">
            <Button className="home__hero-primary" href="/articles">
              {t("exploreArticles")}
              <ArrowRightIcon />
            </Button>
            <Link className="home__hero-secondary" href="/tools">
              {t("browseTools")}
            </Link>
          </div>
          <dl className="home__hero-metrics" aria-label={t("metricsAriaLabel")}>
            {heroMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.value}</dt>
                <dd>{localizedMetric(metric.label)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="home__feature-strip" aria-label={t("mainTopicsAriaLabel")}>
          {heroPillars.map((pillar) => (
            <article
              className={`home__feature home__feature--${pillar.tone.toLowerCase()}`}
              key={pillar.tone}
            >
              <span className="home__feature-icon">
                <FeatureIcon category={pillar.tone} />
              </span>
              <h2>{pillar.title}</h2>
              <p>{pillar.description}</p>
            </article>
          ))}
        </section>

        <section className="home__section" id="articles" aria-labelledby="featured-title">
          <div className="home__section-heading">
            <div>
              <Eyebrow>{t("featuredEyebrow")}</Eyebrow>
              <h2 id="featured-title">{t("featuredTitle")}</h2>
            </div>
            <Link href="/articles">
              {t("viewAll")}
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="home__editors-layout">
            <Link className="home__editor-card" href={`/article/${featured.slug}`}>
              <article>
                <div className="home__editor-image">
                  <Image
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    src={featured.image}
                  />
                  <span
                    className={`home__editor-tag home__editor-tag--${featured.category.toLowerCase()}`}
                  >
                    {tCat(featured.category)}
                  </span>
                </div>
                <div className="home__editor-body">
                  <h2>{ac.title(featured.slug, featured.title)}</h2>
                  <p>{ac.excerpt(featured.slug, featured.excerpt)}</p>
                  <div className="home__editor-meta">
                    <strong>{featured.author}</strong>
                    <span aria-hidden="true">&middot;</span>
                    <span>{featured.publishedAt}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{featured.minutes}</span>
                  </div>
                </div>
              </article>
            </Link>
            <div className="home__side-picks" aria-label={t("moreFeaturedAriaLabel")}>
              {sidePicks.map((article) => {
                const title = ac.title(article.slug, article.title);
                return (
                  <Link
                    aria-label={`${t("readPrefix")} ${title}`}
                    className="home__side-pick"
                    href={`/article/${article.slug}`}
                    key={article.slug}
                  >
                    <div className="home__side-pick-image">
                      <Image alt={title} fill sizes="180px" src={article.image} />
                    </div>
                    <div>
                      <span>{tCat(article.category)}</span>
                      <h3>{title}</h3>
                      <p>{article.minutes} {t("readSuffix")}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home__section" id="gaming" aria-labelledby="arena-title">
          <div className="home__section-heading">
            <div>
              <Eyebrow>{t("gamingEyebrow")}</Eyebrow>
              <h2 id="arena-title">{t("gamingTitle")}</h2>
            </div>
            <Link href="/category/gaming">
              {t("viewAll")}
              <ArrowRightIcon />
            </Link>
          </div>
          <ArticleGrid className="home__article-grid">
            {gamingArticles.map((article, index) => (
              <ArticleCard article={article} eager={index === 0} key={article.slug} />
            ))}
          </ArticleGrid>
        </section>

        <section className="home__section" id="ai" aria-labelledby="builder-title">
          <div className="home__section-heading">
            <div>
              <Eyebrow>{t("aiDevEyebrow")}</Eyebrow>
              <h2 id="builder-title">{t("aiDevTitle")}</h2>
            </div>
            <Link href="/articles">
              {t("viewAll")}
              <ArrowRightIcon />
            </Link>
          </div>
          <ArticleGrid className="home__article-grid">
            {aiDevArticles.map((article, index) => (
              <ArticleCard article={article} eager={index === 0} key={article.slug} />
            ))}
          </ArticleGrid>
        </section>

        <section className="home__section" id="tools" aria-labelledby="tools-title">
          <div className="home__section-heading">
            <div>
              <Eyebrow>{t("toolsEyebrow")}</Eyebrow>
              <h2 id="tools-title">{t("toolsTitle")}</h2>
            </div>
            <Link href="/tools">
              {t("viewAll")}
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="home__tool-grid">
            {freeTools.map((tool) => (
              <Link className="home__tool-card" href={`/tools/${tool.slug}`} key={tool.slug}>
                <span className="home__tool-glow" aria-hidden="true" />
                <span className="home__tool-card-top">
                  <span className="home__tool-icon">
                    <HomeToolIcon slug={tool.slug} />
                  </span>
                  <ArrowUpRightIcon className="home__tool-card-arrow" />
                </span>
                <h3>{tc.title(tool.slug, tool.title)}</h3>
                <p>{tc.description(tool.slug, tool.description)}</p>
                <span className="home__tool-card-meta">
                  <span>{tToolCat(TOOL_TYPE_KEYS[tool.type] ?? "Developer")}</span>
                  <strong>{localizedMetricValue(tool.metric)}</strong>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home__topic-panel" aria-label={t("trendingAriaLabel")}>
          <h2>{t("trendingHeading")}</h2>
          <div>
            {trendingTopics.map((topic) => (
              <Link href="/articles" key={topic}>
                #{localizedTopic(topic)}
              </Link>
            ))}
          </div>
        </section>

        <section className="home__newsletter" id="about" aria-labelledby="newsletter-title">
          <Eyebrow>{t("newsletterEyebrow")}</Eyebrow>
          <h2 id="newsletter-title">{t("newsletterTitle")}</h2>
          <p>{t("newsletterCopy")}</p>
          <form className="home__newsletter-form">
            <input
              aria-label={t("newsletterAriaLabel")}
              placeholder={t("newsletterPlaceholder")}
              type="email"
            />
            <Button type="submit">{t("subscribe")}</Button>
          </form>
          <p className="home__newsletter-note">{t("newsletterNote")}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
