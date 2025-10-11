"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function Loading() {
  const t = useI18n();
  const { direction } = useLanguage();

  return (
    <div dir={direction} className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-700 dark:text-slate-200">
        <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
        <div className="text-sm">{t("جاري التحميل...", "Loading...")}</div>
      </div>
    </div>
  );
}
