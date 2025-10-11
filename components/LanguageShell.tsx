"use client";

import { ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";
import LanguageToggle from "./LanguageToggle";

export default function LanguageShell({
  children,
}: {
  children: ReactNode;
}) {
  const { direction, t } = useLanguage();

  return (
    <div dir={direction} className="relative flex min-h-screen flex-col">
      <div className="absolute top-4 left-4 z-50">
        <LanguageToggle />
      </div>
      <main className="flex-1 pt-20">{children}</main>
      <footer className="border-t border-slate-200 bg-white/80 py-10 text-slate-700 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <a
              href="/terms-of-use"
              className="transition hover:text-slate-900 dark:hover:text-white"
            >
              {t("شروط الاستخدام", "Terms of Use")}
            </a>
            <span className="hidden text-slate-400 sm:inline">|</span>
            <a
              href="/privacy-policy"
              className="transition hover:text-slate-900 dark:hover:text-white"
            >
              {t("سياسة الخصوصية", "Privacy Policy")}
            </a>
          </nav>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            SanadGPT.com © 2025. {t("جميع الحقوق محفوظة.", "All Rights Reserved.")}
          </p>
        </div>
      </footer>
    </div>
  );
}
