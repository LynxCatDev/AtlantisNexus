import { languages } from "@/constants/languages";

import { CheckIcon, GlobeIcon } from "../Icons/Icons";
import "./LanguageSwitcher.scss";

export function LanguageSwitcher() {
  const activeLanguage = languages.find((language) => language.active) ?? languages[0];

  return (
    <details className="language-switch">
      <summary className="language-switch__trigger" aria-label="Choose language">
        <GlobeIcon />
        <span>{activeLanguage.short}</span>
      </summary>
      <div className="language-switch__menu">
        <h2>Language</h2>
        <div className="language-switch__options">
          {languages.map((language) => (
            <button
              className={
                language.active
                  ? "language-switch__option language-switch__option--active"
                  : "language-switch__option"
              }
              key={language.code}
              type="button"
            >
              <span className="language-switch__code">{language.code}</span>
              <span>{language.label}</span>
              {language.active ? <CheckIcon /> : null}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
