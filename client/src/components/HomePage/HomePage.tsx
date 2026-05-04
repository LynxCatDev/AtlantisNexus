import Image from "next/image";
import Link from "next/link";

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
import type { ArticleCategory } from "@/types/content";

import "./HomePage.scss";

const HERO_PILLARS: { tone: ArticleCategory; title: string; description: string }[] = [
  {
    tone: "Gaming",
    title: "Gaming",
    description: "News, RPG guides and analysis without the clickbait.",
  },
  {
    tone: "AI",
    title: "AI",
    description: "Practical AI for builders — tools, agents, systems that ship.",
  },
  {
    tone: "Dev",
    title: "Dev",
    description: "React, TypeScript, edge runtimes, architecture that scales.",
  },
];

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

function SectionHeading({
  eyebrow,
  href = "/articles",
  id,
  title,
}: {
  eyebrow: string;
  href?: string;
  id: string;
  title: string;
}) {
  return (
    <div className="home__section-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id}>{title}</h2>
      </div>
      <Link href={href}>
        View all
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

export function HomePage() {
  const featured = articles[0];
  const sidePicks = articles.slice(1, 4);
  const gamingArticles = articles.filter((a) => a.category === "Gaming").slice(0, 3);
  const aiDevArticles = articles.filter((a) => a.category !== "Gaming").slice(0, 3);

  return (
    <div className="app-frame home">
      <Header />
      <main className="home__main">
        <section className="home__hero" aria-labelledby="home-title">
          <p className="home__release-pill">
            <SparkleIcon />
            <span>2026 era notes &middot; v1.0</span>
          </p>
          <h1 id="home-title">
            The hub for <span>gamers, builders</span> and the curious.
          </h1>
          <p>
            News, deep guides and field-tested tools across gaming, AI and modern web
            development. One place. Zero noise.
          </p>
          <div className="home__hero-actions">
            <Button className="home__hero-primary" href="/articles">
              Explore articles
              <ArrowRightIcon />
            </Button>
            <Link className="home__hero-secondary" href="/tools">
              Browse tools
            </Link>
          </div>
          <dl className="home__hero-metrics" aria-label="Atlantis Nexus metrics">
            {heroMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.value}</dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="home__feature-strip" aria-label="Main topics">
          {HERO_PILLARS.map((pillar) => (
            <article
              className={`home__feature home__feature--${pillar.tone.toLowerCase()}`}
              key={pillar.title}
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
          <SectionHeading
            eyebrow="Featured story"
            id="featured-title"
            title="This week's pick"
          />
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
                    {featured.category}
                  </span>
                </div>
                <div className="home__editor-body">
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
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
            <div className="home__side-picks" aria-label="More featured articles">
              {sidePicks.map((article) => (
                <Link
                  aria-label={`Read ${article.title}`}
                  className="home__side-pick"
                  href={`/article/${article.slug}`}
                  key={article.slug}
                >
                  <div className="home__side-pick-image">
                    <Image alt={article.title} fill sizes="180px" src={article.image} />
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

        <section className="home__section" id="gaming" aria-labelledby="arena-title">
          <SectionHeading
            eyebrow="Gaming"
            href="/category/gaming"
            id="arena-title"
            title="Latest from the arena"
          />
          <ArticleGrid className="home__article-grid">
            {gamingArticles.map((article, index) => (
              <ArticleCard article={article} eager={index === 0} key={article.slug} />
            ))}
          </ArticleGrid>
        </section>

        <section className="home__section" id="ai" aria-labelledby="builder-title">
          <SectionHeading
            eyebrow="AI &amp; Dev"
            id="builder-title"
            title="Build smarter, ship faster"
          />
          <ArticleGrid className="home__article-grid">
            {aiDevArticles.map((article, index) => (
              <ArticleCard article={article} eager={index === 0} key={article.slug} />
            ))}
          </ArticleGrid>
        </section>

        <section className="home__section" id="tools" aria-labelledby="tools-title">
          <SectionHeading
            eyebrow="Free tools"
            href="/tools"
            id="tools-title"
            title="Useful, fast, no signup"
          />
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
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span className="home__tool-card-meta">
                  <span>{tool.type}</span>
                  <strong>{tool.metric}</strong>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home__topic-panel" aria-label="Trending topics">
          <h2>Trending topics</h2>
          <div>
            {trendingTopics.map((topic) => (
              <Link href="/articles" key={topic}>
                #{topic}
              </Link>
            ))}
          </div>
        </section>

        <section className="home__newsletter" id="about" aria-labelledby="newsletter-title">
          <Eyebrow>Weekly signal</Eyebrow>
          <h2 id="newsletter-title">Signal, never noise.</h2>
          <p>
            One email a week. The best gaming news, AI breakthroughs, and dev essays,
            curated by humans, not algorithms.
          </p>
          <form className="home__newsletter-form">
            <input aria-label="Email address" placeholder="you@domain.com" type="email" />
            <Button type="submit">Subscribe</Button>
          </form>
          <p className="home__newsletter-note">No spam. Unsubscribe anytime.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
