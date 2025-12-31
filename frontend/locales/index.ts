import { en } from "./en";
import { zhTW } from "./zh-TW";

export type Language = "en" | "zh-TW";

export const translations: Record<Language, Record<string, string>> = {
  en,
  "zh-TW": zhTW,
};

export const languageNames: Record<Language, string> = {
  en: "English",
  "zh-TW": "繁體中文",
};

export const languages: Language[] = ["en", "zh-TW"];
