import de from "./locales/de";
import en from "./locales/en";
import fr from "./locales/fr";
import tr from "./locales/tr";
import ar from "./locales/ar";

export type Language = "de" | "en" | "fr" | "tr" | "ar";

export const languageNames: Record<Language, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  ar: "العربية",
};

export const languageFlags: Record<Language, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  tr: "🇹🇷",
  ar: "🇸🇦",
};

export const translations = { de, en, fr, tr, ar } as const;

export type TranslationKey = keyof typeof de;
