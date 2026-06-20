import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { EN_BASE, getLangDir } from "../lib/i18n";
import { getTranslations } from "../lib/translateGuest";

const Ctx = createContext(null);
export const useGuestLang = () => useContext(Ctx);

export const GuestLangProvider = ({ children }) => {
  const [lang,        setLang]        = useState(() => localStorage.getItem("guest_lang") || "en");
  const [texts,       setTexts]       = useState(EN_BASE);
  const [translating, setTranslating] = useState(false);

  // Sahifa yuklanganda saqlangan tilni yuklash
  useEffect(() => {
    const saved = localStorage.getItem("guest_lang") || "en";
    if (saved !== "en") loadLang(saved, false);
    applyDir(saved);
  }, []);

  const applyDir = (code) => {
    document.documentElement.dir  = getLangDir(code);
    document.documentElement.lang = code;
  };

  const loadLang = useCallback(async (code, showLoading = true) => {
    applyDir(code);
    if (code === "en") {
      setTexts(EN_BASE);
      setLang("en");
      localStorage.setItem("guest_lang", "en");
      return;
    }
    if (showLoading) setTranslating(true);
    try {
      const result = await getTranslations(code);
      setTexts(result);
      setLang(code);
      localStorage.setItem("guest_lang", code);
    } finally {
      setTranslating(false);
    }
  }, []);

  const t = (key) => texts[key] ?? EN_BASE[key] ?? key;

  return (
    <Ctx.Provider value={{ lang, t, translating, changeLang: loadLang }}>
      {children}
    </Ctx.Provider>
  );
};
