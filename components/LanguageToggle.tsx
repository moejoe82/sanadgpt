"use client";

import { useLanguage } from "./LanguageProvider";
import { Button } from "@/components/ui/button";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  const label = language === "ar" ? "English" : "العربية";
  const ariaLabel =
    language === "ar" ? "التبديل إلى اللغة الإنجليزية" : "Switch to Arabic";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={ariaLabel}
      onClick={toggleLanguage}
      className="rounded-full border-[#d0def5] bg-white/80 px-5 text-xs font-semibold uppercase tracking-wide text-[#0f2a5a] shadow-sm transition hover:bg-white"
    >
      {label}
    </Button>
  );
}
