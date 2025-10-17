"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "./LanguageProvider";
import LanguageToggle from "./LanguageToggle";
import Container from "@/components/layouts/Container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LanguageShell({ children }: { children: ReactNode }) {
  const { direction, t } = useLanguage();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  const navItems = !isDashboard
    ? [
        {
          href: "#solutions",
          label: t("الحلول", "Solutions"),
        },
        {
          href: "#features",
          label: t("المميزات", "Features"),
        },
        {
          href: "#workflow",
          label: t("آلية العمل", "Workflow"),
        },
        {
          href: "#contact",
          label: t("تواصل", "Contact"),
        },
      ]
    : [];

  return (
    <div dir={direction} className="relative flex min-h-screen flex-col">
      {!isDashboard && (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <Container className="flex items-center justify-between gap-4 py-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-start"
              aria-label={t("العودة إلى الصفحة الرئيسية", "Back to home")}
            >
              <Image
                src="/sanadgpt-logo.svg"
                alt={t("شعار SanadGPT", "SanadGPT logo")}
                width={132}
                height={48}
                className="h-10 w-auto"
                priority
              />
              <div className="hidden sm:block">
                <span className="block text-sm font-semibold uppercase tracking-[0.3em] text-[#0f2a5a]/60">
                  SANADGPT
                </span>
                <span className="block text-base font-bold text-[#0f2a5a]">
                  {t("حلول الوثائق الذكية", "Intelligent document solutions")}
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-[#0f2a5a] lg:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group relative transition-colors hover:text-[#1e62b7]"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-[#f9b233] transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Button
                asChild
                size="sm"
                className="hidden rounded-full bg-[#f9b233] px-5 text-xs font-bold uppercase tracking-wide text-[#0a2540] shadow-sm transition hover:bg-[#f7a614] sm:inline-flex"
              >
                <a href="/login">{t("تسجيل الدخول", "Login")}</a>
              </Button>
            </div>
          </Container>
        </header>
      )}
      <main className={cn("flex-1", isDashboard && "contents")}>
        {children}
      </main>
      {!isDashboard && (
        <footer id="contact" className="mt-20 bg-[#0f2a5a] text-white">
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,178,51,0.18),_transparent_55%)]" />
            <Container className="relative flex flex-col gap-10 py-12">
              <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
                <div className="space-y-4">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
                    SANADGPT
                  </span>
                  <h2 className="text-2xl font-bold text-white">
                    {t(
                      "منصة عربية موثوقة لإدارة وثائق التدقيق والتحول الرقمي",
                      "A trusted Arabic-first platform for audit documentation and digital transformation"
                    )}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/75">
                    {t(
                      "نقدم حلولاً متكاملة للجهات التعليمية والهيئات التنظيمية لإدارة المعرفة، تسريع اتخاذ القرار، وتوفير أعلى معايير الحوكمة.",
                      "We deliver end-to-end solutions for educational institutions and regulators to manage knowledge, accelerate decisions, and uphold governance standards."
                    )}
                  </p>
                </div>
                <div className="grid gap-6 text-sm">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {t("تواصل معنا", "Contact us")}
                    </h3>
                    <p className="mt-2 text-white/75">support@sanadgpt.com</p>
                    <p className="text-white/75">+971 55 123 4567</p>
                  </div>
                  <div className="flex flex-col gap-2 text-white/70">
                    <a href="/terms-of-use" className="transition hover:text-[#f9b233]">
                      {t("شروط الاستخدام", "Terms of Use")}
                    </a>
                    <a href="/privacy-policy" className="transition hover:text-[#f9b233]">
                      {t("سياسة الخصوصية", "Privacy Policy")}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                <p>© 2025 SanadGPT. {t("جميع الحقوق محفوظة.", "All rights reserved.")}</p>
                <div className="flex items-center gap-4">
                  {navItems.map((item) => (
                    <a key={item.href} href={item.href} className="transition hover:text-[#f9b233]">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </Container>
          </div>
        </footer>
      )}
    </div>
  );
}
