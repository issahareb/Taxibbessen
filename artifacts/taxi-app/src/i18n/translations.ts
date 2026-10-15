import de from "./locales/de";

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

export type Dictionary = Record<keyof typeof de, string>;
export const defaultDictionary: Dictionary = de;
const dictionaries: Partial<Record<Language, Dictionary>> = { de };
const pending: Partial<Record<Language, Promise<Dictionary>>> = {};
const loaders = {
  en: () => import("./locales/en"),
  fr: () => import("./locales/fr"),
  tr: () => import("./locales/tr"),
  ar: () => import("./locales/ar"),
};

export async function loadDictionary(lang: Language): Promise<Dictionary> {
  if (dictionaries[lang]) return dictionaries[lang]!;
  if (lang === "de") return de;
  return pending[lang] ??= loaders[lang]().then(module => {
    dictionaries[lang] = module.default;
    return module.default;
  }).finally(() => { delete pending[lang]; });
}

export type TranslationKey = keyof typeof de;
