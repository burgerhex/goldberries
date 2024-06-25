import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "cn", name: "Chinese" },
];

const DETECTION_OPTIONS = {
  order: ["localStorage", "navigator"],
  caches: ["localStorage"],
};

i18n
  .use(LanguageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    // lng: "en",
    fallbackLng: "en",
    detection: DETECTION_OPTIONS,
    supportedLngs: LANGUAGES.map((lang) => lang.code),
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;