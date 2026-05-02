import { languages } from "@/constants/languages";

import { CheckIcon, GlobeIcon } from "../Icons/Icons";

export function LanguageSwitcher() {
  const activeLanguage = languages.find((language) => language.active) ?? languages[0];

  return (
    <details className="language-switch">
      <summary className="language-trigger" aria-label="Choose language">
        <GlobeIcon />
        <span>{activeLanguage.short}</span>
      </summary>
      <div className="language-menu">
        <h2>Language</h2>
        <div className="language-options">
          {languages.map((language) => (
            <button
              className={language.active ? "language-option active" : "language-option"}
              key={language.code}
              type="button"
            >
              <span className="language-code">{language.code}</span>
              <span>{language.label}</span>
              {language.active ? <CheckIcon /> : null}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
