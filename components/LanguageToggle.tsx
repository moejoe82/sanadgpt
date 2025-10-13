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
      className="rounded-full border-border/60 bg-background/80 px-5 text-sm font-semibold text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      {label}
    </Button>
  );
}
