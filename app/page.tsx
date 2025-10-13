"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const t = useI18n();
  const { direction } = useLanguage();
  const heroAlign =
    direction === "rtl"
      ? "items-end text-right sm:items-center sm:text-center"
      : "items-start text-left sm:items-center sm:text-center";
  const cardAlign = direction === "rtl" ? "text-right" : "text-left";

  const features = [
    {
      title: t("رفع المستندات", "Easy Upload"),
      description: t(
        "حمّل ملفات PDF/DOCX/TXT بسهولة مع دعم السحب والإفلات وتنظيم تلقائي.",
        "Upload PDF/DOCX/TXT files easily with drag & drop and automatic organisation."
      ),
    },
    {
      title: t("بحث ذكي", "Smart Search"),
      description: t(
        "استعرض المحتوى بسرعة مع فهرسة دقيقة ودمج مع البحث بالملفات لاستخراج المراجع.",
        "Browse content quickly with precise indexing and integrated search to surface references."
      ),
    },
    {
      title: t("إجابات دقيقة", "Accurate Answers"),
      description: t(
        "احصل على إجابات موثوقة مدعومة بالاقتباسات من مصادر معتمدة.",
        "Receive trustworthy answers backed by citations from verified sources."
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 pb-16 pt-12 sm:gap-20 sm:pt-20">
      <section className={`flex flex-col gap-6 ${heroAlign}`}>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">SanadGPT</h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t(
            "نظام ذكي لإدارة وثائق التدقيق",
            "Intelligent audit document management"
          )}
        </p>
        <a
          href="/login"
          className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {t("ابدأ الآن", "Get Started")}
        </a>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className={`flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-transparent p-6 ${cardAlign}`}
          >
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
