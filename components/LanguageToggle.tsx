"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500 dark:text-slate-300">
        {t("اللغة", "Language")}:
      </span>
      <div className="inline-flex rounded-md border border-slate-300 overflow-hidden bg-white dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setLanguage("ar")}
          className={`px-3 py-1 transition ${
            language === "ar"
              ? "bg-slate-900 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          العربية
        </button>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 transition ${
            language === "en"
              ? "bg-slate-900 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          English
        </button>
      </div>
      <button
        type="button"
        onClick={toggleLanguage}
        className="px-2 py-1 text-xs border border-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        {t("تبديل", "Switch")}
      </button>
    </div>
  );
}
