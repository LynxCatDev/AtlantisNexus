import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { BrainIcon, CodeIcon, GamepadIcon } from "@/components/Icons/Icons";
import {
  arenaArticles,
  builderArticles,
  editorPick,
  freeTools,
  heroMetrics,
  homeFeatures,
  sidePicks,
  trendingTopics,
} from "@/constants/home";
import type { ArticleCategory } from "@/types/content";

function SectionHeading({
  eyebrow,
  id,
  title,
}: {
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      <Link href="/articles">View all</Link>
    </div>
  );
}

function FeatureIcon({ category }: { category: ArticleCategory }) {
  if (category === "Gaming") {
    return <GamepadIcon />;
  }

  if (category === "AI") {
    return <BrainIcon />;
  }

  return <CodeIcon />;
}

export function HomePage() {
  return (
    <div className="app-frame">
      <Header />
      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="home-title">
          <p className="release-pill">2026 era notes - v1.0</p>
          <h1 id="home-title">
            The hub for <span>gamers, builders</span> and the curious.
          </h1>
          <p>
            News, deep guides and field-tested tools across gaming, AI and modern web
            development. One place. Zero noise.
          </p>
          <div className="hero-actions">
            <Link className="button hero-primary" href="/articles">
              Explore articles
            </Link>
            <Link className="hero-secondary" href="#tools">
              Browse tools
            </Link>
          </div>
          <dl className="hero-metrics" aria-label="Atlantis Nexus metrics">
            {heroMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.value}</dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="feature-strip" aria-label="Main topics">
          {homeFeatures.map((feature) => (
            <article className={`feature-card feature-${feature.accent.toLowerCase()}`} key={feature.title}>
              <span className="feature-icon">
                <FeatureIcon category={feature.accent} />
              </span>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="home-section" id="articles" aria-labelledby="featured-title">
          <SectionHeading eyebrow="Featured story" id="featured-title" title="This week's pick" />
          <div className="editors-layout">
            <Link className="editor-card" href={`/article/${editorPick.slug}`}>
              <article>
                <div className="editor-image">
                  <Image
                    alt={editorPick.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 66vw"
                    src={editorPick.image}
                  />
                  <span className={`tag tag-${editorPick.category.toLowerCase()}`}>
                    {editorPick.category}
                  </span>
                </div>
                <div className="editor-body">
                  <h2>{editorPick.title}</h2>
                  <p>{editorPick.excerpt}</p>
                  <div className="article-meta">
                    <strong>{editorPick.author}</strong>
                    <span aria-hidden="true">&middot;</span>
                    <span>Apr 24, 2026</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{editorPick.minutes}</span>
                  </div>
                </div>
              </article>
            </Link>
            <div className="side-picks" aria-label="More featured articles">
              {sidePicks.map((article) => (
                <Link
                  aria-label={`Read ${article.title}`}
                  className="side-pick"
                  href={`/article/${article.slug}`}
                  key={article.slug}
                >
                  <div className="side-pick-image">
                    <Image
                      alt={article.title}
                      fill
                      sizes="180px"
                      src={article.image}
                    />
                  </div>
                  <div>
                    <span>{article.category}</span>
                    <h3>{article.title}</h3>
                    <p>{article.minutes} read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section" id="gaming" aria-labelledby="arena-title">
          <SectionHeading eyebrow="Gaming" id="arena-title" title="Latest from the arena" />
          <div className="compact-article-grid">
            {arenaArticles.map((article) => (
              <ArticleCard article={article} key={article.title} />
            ))}
          </div>
        </section>

        <section className="home-section" id="ai" aria-labelledby="builder-title">
          <SectionHeading eyebrow="AI & Dev" id="builder-title" title="Build smarter, ship faster" />
          <div className="article-grid home-article-grid">
            {builderArticles.map((article) => (
              <ArticleCard article={article} key={article.title} />
            ))}
          </div>
        </section>

        <section className="home-section" id="tools" aria-labelledby="tools-title">
          <SectionHeading eyebrow="Free tools" id="tools-title" title="Useful, fast, no signup" />
          <div className="tool-grid">
            {freeTools.map((tool) => (
              <article className="tool-card" key={tool.title}>
                <span className="tool-icon">{tool.title.slice(0, 2)}</span>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div>
                  <span>{tool.type}</span>
                  <strong>{tool.metric}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="topic-panel" aria-label="Trending topics">
          <h2>Trending topics</h2>
          <div>
            {trendingTopics.map((topic) => (
              <Link href="/articles" key={topic}>
                #{topic}
              </Link>
            ))}
          </div>
        </section>

        <section className="newsletter-panel" id="about" aria-labelledby="newsletter-title">
          <p className="eyebrow">Weekly signal</p>
          <h2 id="newsletter-title">Signal, never noise.</h2>
          <p>
            One email a week. The best gaming news, AI breakthroughs, and dev essays,
            curated by humans, not algorithms.
          </p>
          <form className="newsletter-form">
            <input aria-label="Email address" placeholder="you@domain.com" type="email" />
            <button className="button" type="submit">
              Subscribe
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
