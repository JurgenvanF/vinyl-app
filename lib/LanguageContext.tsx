"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Locale = "en" | "nl";

type LanguageContextType = {
  locale: Locale;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");

  const toggleLocale = () => {
    setLocale((prev) => (prev === "en" ? "nl" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
