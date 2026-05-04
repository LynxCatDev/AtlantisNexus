"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

import { languages } from "@/constants/languages";
import type { Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/locale";

import { CheckIcon, GlobeIcon } from "../Icons/Icons";
import "./LanguageSwitcher.scss";

export function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  const active = languages.find((lang) => lang.locale === current) ?? languages[0];

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.open = false;
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (locale: Locale) => {
    if (locale === current || pending) {
      close();
      return;
    }
    close();
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <details className="language-switch" ref={detailsRef}>
      <summary className="language-switch__trigger" aria-label={t("ariaLabel")}>
        <GlobeIcon />
        <span>{active.short}</span>
      </summary>
      <div className="language-switch__menu">
        <h2>{t("heading")}</h2>
        <div className="language-switch__options">
          {languages.map((lang) => {
            const isActive = lang.locale === current;
            return (
              <button
                className={
                  isActive
                    ? "language-switch__option language-switch__option--active"
                    : "language-switch__option"
                }
                disabled={pending}
                key={lang.locale}
                onClick={() => choose(lang.locale)}
                type="button"
              >
                <span className="language-switch__code">{lang.short}</span>
                <span>{lang.label}</span>
                {isActive ? <CheckIcon /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}
