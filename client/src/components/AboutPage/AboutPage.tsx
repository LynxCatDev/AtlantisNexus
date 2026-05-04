import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { CodeIcon, FileTextIcon, SparkleIcon } from "@/components/Icons/Icons";

import "./AboutPage.scss";

const pillars = [
  {
    title: "Editorial-first",
    copy: "Deep stories, clear angles, and context that respects your time.",
    icon: FileTextIcon,
  },
  {
    title: "Tools that ship",
    copy: "Fast utilities that solve small everyday problems without accounts.",
    icon: CodeIcon,
  },
  {
    title: "Reader-funded",
    copy: "Built around curious readers, not feeds designed to exhaust them.",
    icon: SparkleIcon,
  },
];

export function AboutPage() {
  return (
    <div className="app-frame">
      <Header activeLabel="About" />
      <main className="about-page__main">
        <section className="about-page__hero" aria-labelledby="about-title">
          <Eyebrow>About Atlantis Nexus</Eyebrow>
          <h1 id="about-title">
            A calmer home for the <span>curious</span>.
          </h1>
          <p>
            Atlantis Nexus blends long-form editorial, practical web development notes,
            gaming coverage, AI systems thinking, and small tools that help readers move.
          </p>
        </section>

        <section className="about-page__pillars" aria-label="Atlantis Nexus pillars">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article className="about-page__card" key={pillar.title}>
                <span className="about-page__icon">
                  <Icon />
                </span>
                <h2>{pillar.title}</h2>
                <p>{pillar.copy}</p>
              </article>
            );
          })}
        </section>

        <section className="about-page__belief" aria-labelledby="belief-title">
          <Eyebrow>What we believe</Eyebrow>
          <h2 id="belief-title">Signal wins when design gets out of the way.</h2>
          <p>
            We believe a media hub can feel quiet without feeling empty. Articles should
            help you understand what changed, tools should be available the moment you
            need them, and every page should make the next step obvious.
          </p>
          <p>
            Atlantis Nexus is built for people who read carefully, ship thoughtfully, and
            still want the web to feel a little electric.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
