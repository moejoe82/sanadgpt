"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-1 py-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        aria-label="Switch to Arabic"
        className={`mx-1 flex h-9 w-9 items-center justify-center rounded-full text-xl transition ${
          language === "ar"
            ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
            : "hover:bg-slate-100 dark:hover:bg-slate-700"
        }`}
      >
        <span role="img" aria-hidden="true">
          🇸🇦
        </span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
        className={`mx-1 flex h-9 w-9 items-center justify-center rounded-full text-xl transition ${
          language === "en"
            ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
            : "hover:bg-slate-100 dark:hover:bg-slate-700"
        }`}
      >
        <span role="img" aria-hidden="true">
          🇬🇧
        </span>
      </button>
    </div>
  );
}
