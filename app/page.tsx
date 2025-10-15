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
  FileText,
  Lock,
  Zap,
  Users,
  Activity,
  FolderOpen,
} from "lucide-react";

export default function Home() {
  const t = useI18n();
  const { direction } = useLanguage();
  const isRTL = direction === "rtl";

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
    <PageLayout variant="gradient-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <Container size="lg">
          <div className="relative py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center overflow-visible">
              {/* Main Headline */}
              <div className="px-4 py-4">
                <H1 className="mb-6 text-5xl md:text-7xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-fade-in-up leading-[1.2]">
                  {t(
                    "نظام إدارة وثائق التدقيق",
                    "Audit Document Management System"
                  )}
                </H1>
              </div>

              {/* Subheadline */}
              <Body
                size="lg"
                className="mb-10 text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-up delay-200"
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
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl shadow-blue-500/30 group"
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
      <section className="py-16 border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <Container size="lg">
          <div className="text-center mb-10">
            <H2 className="mb-2 text-3xl">
              {t("إجراءات سريعة", "Quick Actions")}
            </H2>
            <Body className="text-slate-400">
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
                  className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 p-8 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-5 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                    <Icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <H3 className="mb-2 text-white group-hover:text-blue-100 transition-colors">
                    {action.label}
                  </H3>
                  <Body
                    size="sm"
                    className="text-slate-400 group-hover:text-slate-300 transition-colors"
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
            <H2 className="mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {t("المميزات الرئيسية", "Key Features")}
            </H2>
            <Body size="lg" className="text-slate-300 max-w-2xl mx-auto">
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
                  className={`group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 p-8 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-5 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                      <Icon className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>

                    <H3 className="mb-3 text-white group-hover:text-blue-100 transition-colors">
                      {feature.title}
                    </H3>

                    <Body
                      size="sm"
                      className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed"
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
      <section className="py-16 bg-gradient-to-b from-blue-950/20 to-transparent">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center">
            <H2 className="mb-6">
              {t("نظام داخلي متقدم", "Advanced Internal System")}
            </H2>
            <Body size="lg" className="mb-8 text-slate-300">
              {t(
                "منصة SanadGPT توفر لك أدوات متقدمة لإدارة وثائق التدقيق باستخدام الذكاء الاصطناعي، مع حماية كاملة للبيانات وتحكم دقيق في الصلاحيات",
                "SanadGPT platform provides you with advanced tools for managing audit documents using AI, with complete data protection and precise access control"
              )}
            </Body>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
