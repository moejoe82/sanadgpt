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
    <div dir={direction} className="min-h-screen relative">
      <div className="absolute top-4 left-4 z-50">
        <LanguageToggle />
      </div>
      <main className="min-h-screen pt-20">{children}</main>
    </div>
  );
}
