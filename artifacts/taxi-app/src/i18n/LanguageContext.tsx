import { createContext, useRef, useState, ReactNode } from "react";
import { type Language, defaultDictionary, loadDictionary, type TranslationKey } from "./translations";

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [{ lang, dictionary }, setLocale] = useState({ lang: "de" as Language, dictionary: defaultDictionary });
  const selection = useRef(0);

  const setLang = (newLang: Language) => {
    const request = ++selection.current;
    void loadDictionary(newLang).then(dictionary => {
      // Fast successive choices must not allow a slower download to win.
      if (request !== selection.current) return;
      setLocale({ lang: newLang, dictionary });
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    }).catch(() => {
      // Keep the current readable language on a transient network failure;
      // a new selection retries the download.
      if (request === selection.current) console.warn("Sprache konnte nicht geladen werden. Bitte erneut auswählen.");
    });
  };

  const t = (key: TranslationKey): string => {
    return dictionary[key];
  };

  const isRtl = lang === "ar";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}
