"use client";

import Image, { type ImageProps } from "next/image";

import { useI18n, useLanguage } from "@/components/LanguageProvider";

type LocalizedLogoProps = Omit<ImageProps, "src" | "alt">;

export default function LocalizedLogo({ className, ...props }: LocalizedLogoProps) {
  const t = useI18n();
  const { language } = useLanguage();

  const isArabic = language === "ar";

  return (
    <Image
      src={isArabic ? "/sanadgpt-logo-ar.svg" : "/sanadgpt-logo.svg"}
      alt={t(
        "شعار SanadGPT - تمكين الذكاء",
        "SanadGPT logo - Empower Intelligence"
      )}
      className={className}
      {...props}
    />
  );
}
