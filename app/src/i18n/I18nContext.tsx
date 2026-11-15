import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { catalogs, type Locale, type MessageKey } from "./messages";

const STORAGE_KEY = "local_drivers_locale";

type I18nValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
  AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "en" || v === "mr" || v === "hi") setLocaleState(v);
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    void AsyncStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: MessageKey) => catalogs[locale][key] ?? catalogs.en[key],
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n requires I18nProvider");
  return ctx;
}