import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import or from "./locales/or.json";

const LANG_KEY = "cropsage_lang";

const savedLang = localStorage.getItem(LANG_KEY) || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    or: { translation: or },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANG_KEY, lng);
});

export default i18n;
export { LANG_KEY };
