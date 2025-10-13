"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const t = useI18n();
  const { direction } = useLanguage();
  const heroAlign =
    direction === "rtl" ? "text-right sm:text-center" : "text-left sm:text-center";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <section className={`mb-16 ${heroAlign}`}>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">SanadGPT</h1>
          <p className="text-lg sm:text-xl text-slate-200 mb-8">
            {t("نظام ذكي لإدارة وثائق التدقيق", "Intelligent audit document management")}
          </p>
          <a
            href="/login"
            className="inline-block rounded-md bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-100"
          >
            {t("ابدأ الآن", "Get Started")}
          </a>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`rounded-xl bg-white/10 backdrop-blur border border-white/10 p-6 ${cardAlign}`}
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
