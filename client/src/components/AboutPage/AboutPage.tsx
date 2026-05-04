import { useTranslations } from "next-intl";

import { Eyebrow } from "@/components/Eyebrow/Eyebrow";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { CodeIcon, FileTextIcon, SparkleIcon } from "@/components/Icons/Icons";

import "./AboutPage.scss";

export function AboutPage() {
  const t = useTranslations("about");

  const pillars = [
    { titleKey: "pillar1Title", copyKey: "pillar1Copy", icon: FileTextIcon },
    { titleKey: "pillar2Title", copyKey: "pillar2Copy", icon: CodeIcon },
    { titleKey: "pillar3Title", copyKey: "pillar3Copy", icon: SparkleIcon },
  ] as const;

  return (
    <div className="app-frame">
      <Header activeLabel="About" />
      <main className="about-page__main">
        <section className="about-page__hero" aria-labelledby="about-title">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 id="about-title">
            {t("titleStart")} <span>{t("titleAccent")}</span>
            {t("titleEnd")}
          </h1>
          <p>{t("lede")}</p>
        </section>

        <section className="about-page__pillars" aria-label={t("pillarsAriaLabel")}>
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article className="about-page__card" key={pillar.titleKey}>
                <span className="about-page__icon">
                  <Icon />
                </span>
                <h2>{t(pillar.titleKey)}</h2>
                <p>{t(pillar.copyKey)}</p>
              </article>
            );
          })}
        </section>

        <section className="about-page__belief" aria-labelledby="belief-title">
          <Eyebrow>{t("beliefEyebrow")}</Eyebrow>
          <h2 id="belief-title">{t("beliefTitle")}</h2>
          <p>{t("beliefCopy1")}</p>
          <p>{t("beliefCopy2")}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
