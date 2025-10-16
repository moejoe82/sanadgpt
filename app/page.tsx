"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import PageLayout from "@/components/layouts/PageLayout";
import Container from "@/components/layouts/Container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Upload,
  Search,
  MessageSquare,
  Lock,
  Users,
  Activity,
  FolderOpen,
} from "lucide-react";
import LocalizedLogo from "@/components/ui/localized-logo";
import { cn } from "@/lib/utils";

export default function Home() {
  const t = useI18n();
  const { direction, language } = useLanguage();
  const isRTL = direction === "rtl";
  const isArabic = language === "ar";

  const features = [
    {
      icon: Upload,
      title: t("إدارة الوثائق", "Document Management"),
      description: t(
        "رفع وتنظيم وثائق التدقيق بسهولة. دعم كامل لـ PDF و DOCX و TXT",
        "Upload and organize audit documents easily. Full support for PDF, DOCX, and TXT"
      ),
    },
    {
      icon: Search,
      title: t("بحث ذكي", "Smart Search"),
      description: t(
        "ابحث في جميع وثائقك بسرعة وكفاءة باستخدام الذكاء الاصطناعي",
        "Search through all your documents quickly and efficiently using AI"
      ),
    },
    {
      icon: MessageSquare,
      title: t("استفسارات فورية", "Instant Queries"),
      description: t(
        "اطرح أسئلة واحصل على إجابات من وثائق التدقيق مباشرة",
        "Ask questions and get answers from audit documents directly"
      ),
    },
    {
      icon: Lock,
      title: t("أمان البيانات", "Data Security"),
      description: t(
        "حماية كاملة لبياناتك مع صلاحيات وصول محكمة",
        "Complete protection for your data with strict access controls"
      ),
    },
    {
      icon: Users,
      title: t("تعاون الفريق", "Team Collaboration"),
      description: t(
        "شارك وثائقك مع فريق العمل بسهولة وأمان",
        "Share your documents with your team easily and securely"
      ),
    },
    {
      icon: Activity,
      title: t("تتبع النشاط", "Activity Tracking"),
      description: t(
        "راقب جميع العمليات والتغييرات على الوثائق",
        "Monitor all operations and changes to documents"
      ),
    },
  ];

  const quickActions = [
    {
      icon: FolderOpen,
      label: t("تصفح الوثائق", "Browse Documents"),
      description: t(
        "عرض وإدارة جميع الوثائق",
        "View and manage all documents"
      ),
      href: "/dashboard",
    },
    {
      icon: MessageSquare,
      label: t("بدء محادثة", "Start Chat"),
      description: t(
        "ابدأ الاستفسار عن وثائقك",
        "Start querying your documents"
      ),
      href: "/dashboard",
    },
    {
      icon: Upload,
      label: t("رفع وثائق جديدة", "Upload Documents"),
      description: t(
        "أضف وثائق جديدة للنظام",
        "Add new documents to the system"
      ),
      href: "/dashboard",
    },
  ];

  return (
    <PageLayout variant="gradient-sanadgpt">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#cdb4ff]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[#f4f1d0]/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <Container size="lg">
          <div className="relative py-12 md:py-20">
            <div className="max-w-4xl mx-auto text-center overflow-visible">
              <div className="flex justify-center mb-12 animate-fade-in-up">
                <LocalizedLogo
                  width={420}
                  height={150}
                  priority
                  className="w-full max-w-[320px] md:max-w-[420px] h-auto drop-shadow-[0_25px_50px_rgba(244,241,208,0.25)]"
                />
              </div>
              {/* Main Headline */}
              <div className={cn("px-4", isArabic ? "py-4" : "py-2")}> 
                <H1
                  className={cn(
                    "mb-6 bg-gradient-to-r from-[#fdfbf1] via-[#f4f1d0] to-[#fdfbf1] bg-clip-text text-transparent animate-fade-in-up",
                    isArabic
                      ? "text-5xl md:text-7xl leading-[1.2]"
                      : "text-4xl md:text-5xl lg:text-6xl leading-tight max-w-3xl mx-auto"
                  )}
                >
                  {t(
                    "نظام إدارة وثائق التدقيق",
                    "Audit Document Management System"
                  )}
                </H1>
              </div>

              {/* Subheadline */}
              <Body
                size="lg"
                className="mb-10 text-xl text-[#f4f1d0] opacity-90 max-w-2xl mx-auto animate-fade-in-up delay-200"
              >
                {t(
                  "منصة ذكية لإدارة وثائق التدقيق والبحث والاستفسار باستخدام الذكاء الاصطناعي",
                  "Smart platform for managing, searching, and querying audit documents using AI"
                )}
              </Body>

              {/* CTA Button */}
              <div className="animate-fade-in-up delay-300">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-[#9c7adf] via-[#b68df1] to-[#d6b8ff] hover:from-[#a784eb] hover:to-[#e0c9ff] text-[#2e1b4a] font-semibold shadow-2xl shadow-[#cdb4ff]/30 group"
                >
                  <a href="/dashboard" className="flex items-center gap-2">
                    {t("الذهاب إلى لوحة التحكم", "Go to Dashboard")}
                    <ArrowRight
                      className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                        isRTL ? "rotate-180" : ""
                      }`}
                    />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 border-y border-[#f4f1d0]/15 bg-[#f9f5e5]/10 backdrop-blur-sm">
        <Container size="lg">
          <div className="text-center mb-10">
            <H2 className="mb-2 text-3xl">
              {t("إجراءات سريعة", "Quick Actions")}
            </H2>
            <Body className="text-[#f4f1d0] opacity-80">
              {t("ابدأ العمل مباشرة", "Start working right away")}
            </Body>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={index}
                  href={action.href}
                  className="group relative rounded-2xl bg-gradient-to-br from-[#f4f1d0]/20 to-transparent backdrop-blur border border-[#f4f1d0]/20 p-8 hover:border-[#fdfbf1]/60 hover:shadow-[0_25px_50px_-20px_rgba(205,180,255,0.5)] transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#9c7adf]/30 to-[#d8c1ff]/30 mb-5 group-hover:from-[#b68df1]/40 group-hover:to-[#f2e6ff]/40 transition-all">
                    <Icon className="w-8 h-8 text-[#fdfbf1] drop-shadow group-hover:text-[#f4f1d0] transition-colors" />
                  </div>
                  <H3 className="mb-2 text-[#fdfbf1] group-hover:text-[#ffffff] transition-colors">
                    {action.label}
                  </H3>
                  <Body
                    size="sm"
                    className="text-[#f4f1d0] opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    {action.description}
                  </Body>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <Container size="lg">
          <div className="text-center mb-16">
            <H2 className="mb-4 bg-gradient-to-r from-[#fdfbf1] via-[#efe4ff] to-[#f3e7ff] bg-clip-text text-transparent">
              {t("المميزات الرئيسية", "Key Features")}
            </H2>
            <Body size="lg" className="text-[#f4f1d0] opacity-90 max-w-2xl mx-auto">
              {t(
                "أدوات شاملة لإدارة وثائق التدقيق بكفاءة",
                "Comprehensive tools for efficient audit document management"
              )}
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative rounded-2xl bg-gradient-to-br from-[#f4f1d0]/18 to-transparent backdrop-blur border border-[#f4f1d0]/20 p-8 hover:border-[#fdfbf1]/60 hover:shadow-[0_25px_50px_-20px_rgba(205,180,255,0.5)] transition-all duration-300 hover:-translate-y-1 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-[#b68df1]/20 group-hover:to-[#f4f1d0]/10 transition-all duration-300" />

                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#9c7adf]/30 to-[#d8c1ff]/30 mb-5 group-hover:from-[#b68df1]/40 group-hover:to-[#f4f1d0]/40 transition-all">
                      <Icon className="w-7 h-7 text-[#fdfbf1] drop-shadow group-hover:text-[#f4f1d0] transition-colors" />
                    </div>

                    <H3 className="mb-3 text-[#fdfbf1] group-hover:text-[#ffffff] transition-colors">
                      {feature.title}
                    </H3>

                    <Body
                      size="sm"
                      className="text-[#f4f1d0] opacity-80 group-hover:opacity-100 transition-opacity leading-relaxed"
                    >
                      {feature.description}
                    </Body>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* System Info Section */}
      <section className="py-16 bg-gradient-to-b from-[#f4f1d0]/10 to-transparent">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center">
            <H2 className="mb-6">
              {t("نظام داخلي متقدم", "Advanced Internal System")}
            </H2>
            <Body size="lg" className="mb-8 text-[#f4f1d0] opacity-90">
              {t(
                "منصة SanadGPT توفر لك أدوات متقدمة لإدارة وثائق التدقيق باستخدام الذكاء الاصطناعي، مع حماية كاملة للبيانات وتحكم دقيق في الصلاحيات",
                "SanadGPT platform provides you with advanced tools for managing audit documents using AI, with complete data protection and precise access control"
              )}
            </Body>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#9c7adf] via-[#b68df1] to-[#d6b8ff] hover:from-[#a784eb] hover:to-[#e0c9ff] text-[#2e1b4a] font-semibold"
            >
              <a href="/login">{t("تسجيل الدخول", "Sign In")}</a>
            </Button>
          </div>
        </Container>
      </section>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </PageLayout>
  );
}
