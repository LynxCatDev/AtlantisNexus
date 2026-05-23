import type { Locale } from "@/i18n/config";

export type LanguageOption = {
  locale: Locale;
  label: string;
  short: string;
};

export const languages: LanguageOption[] = [
  { locale: "en", label: "English", short: "EN" },
  { locale: "ru", label: "Русский", short: "RU" },
  { locale: "ro", label: "Română", short: "RO" },
  { locale: "de", label: "Deutsch", short: "DE" },
  { locale: "es", label: "Español", short: "ES" },
  { locale: "fr", label: "Français", short: "FR" },
];
