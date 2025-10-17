"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import PageLayout from "@/components/layouts/PageLayout";
import Container from "@/components/layouts/Container";
import { H1, H2, H3, Body, Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

export default function Home() {
  const t = useI18n();
  const { direction } = useLanguage();
  const isRTL = direction === "rtl";

  const stats = [
    {
      value: "24+",
      label: t("جهات تعليمية تعتمد علينا", "Educational entities trust us"),
    },
    {
      value: t("65%", "65%"),
      label: t("تخفيض في زمن مراجعة الوثائق", "Faster document review cycle"),
    },
    {
      value: "120K",
      label: t("وثيقة تمت معالجتها بذكاء", "Documents processed intelligently"),
    },
  ];

  const solutions = [
    {
      icon: Building2,
      title: t("حوكمة المؤسسات التعليمية", "Educational governance"),
      description: t(
        "لوحات تحكم متقدمة لمتابعة الأداء والتقارير في الوقت الفعلي.",
        "Advanced oversight dashboards that surface performance indicators and real-time reports."
      ),
    },
    {
      icon: Layers,
      title: t("إدارة معرفية موحدة", "Unified knowledge management"),
      description: t(
        "أرشفة مركزية، تصنيف ذكي، وروابط بين الوثائق والمراسلات الرسمية.",
        "Central archiving, smart classification, and links across audit artefacts and official correspondence."
      ),
    },
    {
      icon: Sparkles,
      title: t("تحليلات مدعومة بالذكاء الاصطناعي", "AI-assisted analytics"),
      description: t(
        "رؤى سياقية، استخلاص النقاط الجوهرية، وتوليد توصيات قابلة للتنفيذ.",
        "Contextual insights, executive summaries, and actionable recommendations generated instantly."
      ),
    },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: t("أمان مؤسسي", "Institutional-grade security"),
      description: t(
        "تشفيـر شامل، إدارة صلاحيات متعددة المستويات، وسجلات تدقيق مفصلة.",
        "End-to-end encryption, granular access controls, and comprehensive audit trails."
      ),
    },
    {
      icon: Users,
      title: t("تعاون ذكي", "Collaborative intelligence"),
      description: t(
        "مساحات عمل مشتركة، تعليقات فورية، وتوزيع مهام يعتمد على الأدوار.",
        "Shared workspaces, instant annotations, and role-based task orchestration."
      ),
    },
    {
      icon: Clock,
      title: t("سرعة وموثوقية", "Speed with reliability"),
      description: t(
        "أتمتة سير العمل من الرفع وحتى الاعتماد النهائي للوثائق.",
        "Automated workflows from upload to approval with guaranteed accuracy."
      ),
    },
    {
      icon: FileText,
      title: t("متعدد اللغات", "Multilingual by design"),
      description: t(
        "دعم كامل للغة العربية والإنجليزية مع فهم سياقي للمصطلحات المتخصصة.",
        "Native Arabic and English support with contextual understanding of industry terminology."
      ),
    },
  ];

  const workflowSteps = [
    {
      title: t("تحميل الوثائق", "Document onboarding"),
      description: t(
        "رفع الملفات من المصادر المختلفة مع التعرف الذكي على البنية والمحتوى.",
        "Ingest documents from every source with smart structure and content recognition."
      ),
    },
    {
      title: t("تصنيف وتحضير", "Classify & prepare"),
      description: t(
        "تنظيف البيانات، إثراء البيانات الوصفية، وربط الوثائق ذات الصلة تلقائياً.",
        "Cleanse data, enrich metadata, and automatically link related materials."
      ),
    },
    {
      title: t("تحليل وتلخيص", "Analyse & summarise"),
      description: t(
        "استخرج الأفكار الرئيسية، المخاطر، والتوصيات المدعومة بالدلائل.",
        "Extract key findings, risks, and evidence-backed recommendations."
      ),
    },
    {
      title: t("متابعة وتنفيذ", "Follow-up & execution"),
      description: t(
        "تتبع الالتزامات، إرسال التذكيرات، وإصدار تقارير للجان العليا.",
        "Track commitments, trigger reminders, and issue reports for leadership committees."
      ),
    },
  ];

  const benefits = [
    {
      icon: CheckCircle2,
      text: t(
        "تكامل مع الأنظمة الإدارية والأرشيفية المعتمدة.",
        "Integrates with existing administrative and archival systems."
      ),
    },
    {
      icon: Workflow,
      text: t(
        "سير عمل قابل للتخصيص يتماشى مع سياساتكم الداخلية.",
        "Customisable workflow that mirrors your internal policies."
      ),
    },
    {
      icon: ShieldCheck,
      text: t(
        "مصادقات متعددة العوامل وحماية مستمرة للبيانات الحساسة.",
        "Multi-factor authentication and continuous protection for sensitive records."
      ),
    },
  ];

  return (
    <PageLayout variant="gradient-sanadgpt">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2a5a] via-[#123b74] to-[#1f4e89] pb-20 pt-16 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-[#f9b233]/20 blur-3xl animate-soft-float" />
          <div
            className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#1e62b7]/30 blur-3xl animate-soft-float"
            style={{ animationDelay: "1.2s" }}
          />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        </div>

        <Container className="relative">
          <div
            className={cn(
              "grid items-center gap-16 lg:grid-cols-2",
              isRTL ? "lg:text-right" : "lg:text-left"
            )}
          >
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                {t("منصة رقمية موثوقة", "Trusted digital platform")}
              </span>
              <H1 className="text-4xl sm:text-5xl md:text-6xl text-white">
                {t(
                  "إدارة وثائق التدقيق بكفاءة مؤسسية وجودة مدارس النخبة",
                  "Enterprise-grade audit document management with the poise of elite schools"
                )}
              </H1>
              <Body size="lg" className="text-white/80 leading-relaxed">
                {t(
                  "SanadGPT يجمع بين التصميم الراقي وتجربة عربية متكاملة لتمكين فرقكم من حفظ المعرفة، ضبط الامتثال، وتحقيق رؤية التحول الرقمي.",
                  "SanadGPT blends refined design with an Arabic-first experience so your teams can preserve knowledge, enforce compliance, and deliver on your digital transformation vision."
                )}
              </Body>

              <div
                className={cn(
                  "flex flex-col gap-4 sm:flex-row",
                  isRTL ? "sm:flex-row-reverse" : undefined
                )}
              >
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-[#f9b233] px-10 py-6 text-base font-semibold text-[#0a2540] shadow-[0_18px_45px_-20px_rgba(15,58,125,0.55)] transition hover:bg-[#f7a614]"
                >
                  <a href="/dashboard">{t("ابدأ تجربة النظام", "Explore the platform")}</a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-white/30 bg-transparent px-10 py-6 text-base font-semibold text-white transition hover:border-white hover:bg-white/10 hover:text-white"
                >
                  <a href="#solutions">{t("تعرف على الحل", "Discover the solution")}</a>
                </Button>
              </div>

              <div className="grid gap-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <div
                  className={cn(
                    "grid gap-4 sm:grid-cols-3",
                    isRTL ? "text-right" : "text-left"
                  )}
                >
                  {stats.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-3xl font-bold text-white">{item.value}</p>
                      <Small className="text-white/70">{item.label}</Small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[3rem] border border-white/15 bg-white/10 p-8 backdrop-blur-xl shadow-[0_30px_70px_-40px_rgba(15,43,90,0.7)]">
                <div className="mb-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">
                      {t("لوحة إشراف", "Oversight board")}
                    </p>
                    <p className="text-lg font-bold text-white">
                      {t("ملخص أسبوعي", "Weekly summary")}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f9b233] px-4 py-1 text-sm font-semibold text-[#0a2540]">
                    {t("جاهز للمشاركة", "Ready to share")}
                  </span>
                </div>

                <div className="space-y-4">
                  {pillars.slice(0, 3).map((pillar, index) => {
                    const Icon = pillar.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-2xl bg-white/12 p-4 backdrop-blur-sm"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <p className="text-base font-semibold text-white">{pillar.title}</p>
                          <p className="text-sm text-white/70">{pillar.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl bg-white/15 p-5 text-white/80">
                  <p className="text-sm font-medium uppercase tracking-[0.35em] text-white/60">
                    {t("نظرة عامة", "At a glance")}
                  </p>
                  <ul
                    className={cn(
                      "mt-3 space-y-2 text-sm",
                      isRTL ? "text-right" : "text-left"
                    )}
                  >
                    <li>{t("٣ لجان إشراف مكتملة هذا الأسبوع.", "3 oversight committees completed this week.")}</li>
                    <li>{t("١٢ توصية في مرحلة المتابعة والتنفيذ.", "12 recommendations under follow-up.")}</li>
                    <li>{t("دقة إجابات الذكاء الاصطناعي بلغت ‎٩٨٪‎.", "AI answer accuracy reached 98%.")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="solutions" className="relative -mt-12 pb-20">
        <Container>
          <div className="grid gap-8 rounded-[2.5rem] bg-white p-10 shadow-[0_30px_80px_-60px_rgba(12,59,162,0.35)]">
            <div className="text-center">
              <H2 className="text-[#0f2a5a]">
                {t("حلول متكاملة برؤية تعليمية", "Integrated solutions inspired by educational excellence")}
              </H2>
              <Body size="lg" className="mx-auto mt-4 max-w-3xl text-[#3a5175]">
                {t(
                  "استلهمنا من هوية المدارس الوطنية لنقدم تجربة رقمية متكاملة، أنيقة، ومخصصة للقطاع التعليمي والرقابي.",
                  "Inspired by the elegance of leading national schools, we crafted a digital journey tailored for educational and regulatory bodies."
                )}
              </Body>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                return (
                  <div
                    key={index}
                    className="group relative flex h-full flex-col rounded-3xl border border-[#dbe6f8] bg-gradient-to-b from-white to-[#f7f9fd] p-8 shadow-sm transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
                  >
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f3c7d]/10 text-[#0f3c7d]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <H3 className="mb-3 text-[#123b74]">{solution.title}</H3>
                    <Body size="base" className="text-[#4a607f]">
                      {solution.description}
                    </Body>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section id="features" className="pb-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
            <div
              className={cn(
                "space-y-6",
                isRTL ? "lg:order-2" : undefined
              )}
            >
              <H2 className="text-[#0f2a5a]">
                {t("ركائز المنصة", "Platform pillars")}
              </H2>
              <Body size="lg" className="text-[#3a5175]">
                {t(
                  "نمزج بين تجربة استخدام فاخرة وأدوات عملية تواكب احتياجاتكم اليومية، مع الحفاظ على هوية مؤسسية تعكس الثقة والريادة.",
                  "We blend a premium user experience with practical tooling that elevates everyday work while signalling trust and leadership."
                )}
              </Body>
              <div className="grid gap-4 sm:grid-cols-2">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={index}
                      className="rounded-3xl border border-[#dbe6f8] bg-white p-6 shadow-[0_20px_45px_-35px_rgba(15,58,125,0.4)]"
                    >
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e62b7]/10 text-[#1e62b7]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#0f2a5a]">{pillar.title}</h3>
                      <p className="mt-2 text-sm text-[#4a607f]">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className={cn(
                "relative flex items-center justify-center",
                isRTL ? "lg:order-1" : undefined
              )}
            >
              <div className="relative w-full max-w-lg overflow-hidden rounded-[3rem] border border-[#dbe6f8] bg-gradient-to-br from-white to-[#f0f5ff] p-8 shadow-[0_30px_80px_-60px_rgba(15,58,125,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,98,183,0.15),_transparent_55%)]" />
                <div className="relative space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#1e62b7]/70">
                      {t("قيد التنفيذ", "In progress")}
                    </p>
                    <span className="rounded-full bg-[#f9b233]/20 px-4 py-1 text-sm font-semibold text-[#0f2a5a]">
                      {t("لجنة الاعتماد", "Accreditation board")}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                      <div key={index} className="rounded-2xl bg-white/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#0f2a5a]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-[#1e62b7]/70" />
                        </div>
                        <p className="mt-3 text-base font-semibold text-[#123b74]">{step.title}</p>
                        <p className="mt-1 text-sm text-[#4a607f]">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="workflow" className="pb-24">
        <Container>
          <div className="rounded-[2.5rem] border border-[#dbe6f8] bg-white p-10 shadow-[0_30px_80px_-60px_rgba(12,59,162,0.35)]">
            <div
              className={cn(
                "mb-10 flex flex-col gap-6 text-center lg:flex-row lg:items-end lg:justify-between",
                isRTL ? "lg:text-right" : "lg:text-left"
              )}
            >
              <div className="space-y-4">
                <H2 className="text-[#0f2a5a]">
                  {t("رحلة تدقيق متكاملة", "A complete audit journey")}
                </H2>
                <Body size="lg" className="text-[#3a5175]">
                  {t(
                    "من الوثيقة الأولى وحتى اعتماد التوصيات النهائية، نوفر سلسلة مترابطة تعكس معايير الجودة في أبرز المؤسسات التعليمية.",
                    "From the first document to the final endorsement, we orchestrate a connected series that mirrors the quality standards of elite educational institutions."
                  )}
                </Body>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex h-full flex-col rounded-3xl border border-[#dbe6f8] bg-[#f7f9fd] p-8 text-[#123b74] shadow-inner shadow-white/60"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1e62b7] shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm leading-relaxed text-[#3a5175]">{benefit.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#0f3c7d] via-[#1e62b7] to-[#2d7dd2] p-10 text-white shadow-[0_30px_70px_-40px_rgba(15,58,125,0.65)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(249,178,51,0.25),_transparent_55%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div
                className={cn(
                  "max-w-2xl space-y-4",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                <H2 className="text-white">
                  {t("جاهزون للارتقاء بإدارة الوثائق؟", "Ready to elevate your document governance?")}
                </H2>
                <Body size="lg" className="text-white/80">
                  {t(
                    "تواصل معنا لعرض مخصص يعكس احتياجاتكم المؤسسية ويضمن انتقالاً سلساً للمنصة.",
                    "Let's craft a tailored rollout that reflects your institutional needs and ensures a seamless transition."
                  )}
                </Body>
              </div>
              <div
                className={cn(
                  "flex flex-col gap-4 sm:flex-row",
                  isRTL ? "sm:flex-row-reverse" : undefined
                )}
              >
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white px-10 py-6 text-base font-semibold text-[#0f3c7d] shadow-lg transition hover:bg-[#f9fafc]"
                >
                  <a href="mailto:hello@sanadgpt.com">{t("حجز عرض تقديمي", "Book a presentation")}</a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-white/40 px-10 py-6 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="/privacy-policy">{t("حماية البيانات", "Data protection")}</a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
