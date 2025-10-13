"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import PageLayout from "@/components/layouts/PageLayout";
import Container from "@/components/layouts/Container";
import Section from "@/components/layouts/Section";
import { H1, H3, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function Home() {
  const t = useI18n();
  const { direction } = useLanguage();
  const heroAlign = direction === "rtl" ? "text-right sm:text-center" : "text-left sm:text-center";
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
    <PageLayout variant="gradient-dark">
      <Container size="lg">
        <Section spacing="lg">
          {/* Hero */}
          <section className={`mb-16 ${heroAlign}`}>
            <H1 className="mb-4">SanadGPT</H1>
            <Body size="lg" className="mb-8">
              {t("نظام ذكي لإدارة وثائق التدقيق", "Intelligent audit document management")}
            </Body>
            <Button asChild size="lg">
              <a href="/login">
                {t("ابدأ الآن", "Get Started")}
              </a>
            </Button>
          </section>

          {/* Features */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-xl bg-white/10 backdrop-blur border border-white/10 p-6 ${cardAlign}`}
              >
                <H3 className="mb-2">{feature.title}</H3>
                <Body size="sm" className="leading-relaxed">
                  {feature.description}
                </Body>
              </div>
            ))}
          </section>
        </Section>
      </Container>
    </PageLayout>
  );
}
