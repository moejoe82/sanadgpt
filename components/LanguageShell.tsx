"use client";

import { ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";
import LanguageToggle from "./LanguageToggle";

export default function LanguageShell({
  children,
}: {
  children: ReactNode;
}) {
  const { direction } = useLanguage();

  return (
    <div dir={direction} className="min-h-screen flex flex-col">
      <header className="w-full border-b border-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
          <LanguageToggle />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
