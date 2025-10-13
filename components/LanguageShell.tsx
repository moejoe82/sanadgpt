"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import LanguageToggle from "./LanguageToggle";
import { cn } from "@/lib/utils";

export default function LanguageShell({ children }: { children: ReactNode }) {
  const { direction, t } = useLanguage();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  return (
    <div
      dir={direction}
      className="relative flex min-h-screen flex-col"
    >
      {!isDashboard && (
        <header className="sticky top-0 z-40 flex items-center justify-end gap-3 border-b border-border/60 bg-background/70 px-safe pt-safe-t pb-3 text-sm shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
          <LanguageToggle />
        </header>
      )}
      <main
        className={cn(
          "flex-1",
          isDashboard && "contents"
        )}
      >
        {children}
      </main>
      <footer className="border-t border-border/60 bg-background/80 px-safe pb-safe-b pt-8 text-sm text-muted-foreground shadow-[0_-20px_60px_-40px_hsl(var(--shadow-soft))] backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-start">
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <a
              href="/terms-of-use"
              className="font-medium text-foreground transition hover:text-primary"
            >
              {t("شروط الاستخدام", "Terms of Use")}
            </a>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <a
              href="/privacy-policy"
              className="font-medium text-foreground transition hover:text-primary"
            >
              {t("سياسة الخصوصية", "Privacy Policy")}
            </a>
          </nav>
          <p className="text-xs text-muted-foreground">
            © 2025 SanadGPT. {t("جميع الحقوق محفوظة.", "All rights reserved.")}
          </p>
        </div>
      </footer>
    </div>
  );
}
