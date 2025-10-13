"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  UploadCloud,
  FileText,
  ShieldCheck,
  Menu,
  LogOut,
  Loader2,
} from "lucide-react";

import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentsList from "@/components/DocumentsList";
import AdminDashboard from "@/components/AdminDashboard";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const NAV_ICONS = {
  chat: MessageSquare,
  upload: UploadCloud,
  documents: FileText,
  admin: ShieldCheck,
} as const;

type TabKey = "chat" | "upload" | "documents" | "admin";

type NavItem = {
  key: TabKey;
  label: string;
  description: string;
  badge?: ReactNode;
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(80);
  const t = useI18n();
  const { direction, language } = useLanguage();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }
      setEmail(user.email ?? null);

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          if (user.email === "admin@sanadgpt.com") {
            setIsAdmin(true);
          }
        } else if (data?.role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.warn("Error resolving user role", err);
        if (user.email === "admin@sanadgpt.com") {
          setIsAdmin(true);
        }
      }

      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const updateHeight = () => {
      setHeaderHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateHeight());
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const navItems = useMemo<NavItem[]>(() => {
    const base: NavItem[] = [
      {
        key: "chat",
        label: t("المحادثة", "Chat"),
        description: t("اسأل النظام واحصل على إجابات فورية.", "Ask the workspace for instant insights."),
      },
      {
        key: "upload",
        label: t("رفع", "Upload"),
        description: t("أضف مستندات جديدة إلى مساحة العمل.", "Bring new documents into the workspace."),
      },
      {
        key: "documents",
        label: t("المستندات", "Documents"),
        description: t("استعرض الملفات المؤرشفة وتحقق من حالتها.", "Review and track uploaded records."),
      },
    ];

    if (isAdmin) {
      base.push({
        key: "admin",
        label: t("الإدارة", "Admin"),
        description: t("مقاييس النظام وإدارة المستخدمين.", "System metrics and controls."),
        badge: <Badge variant="outline">{t("مستوى مرتفع", "Elevated")}</Badge>,
      });
    }

    return base;
  }, [isAdmin, t]);

  const asideStyle: CSSProperties = useMemo(
    () => ({
      top: headerHeight,
      insetInlineStart: 0,
      blockSize: `calc(100dvh - ${headerHeight}px)`,
    }),
    [headerHeight]
  );

  async function logout() {
    await supabase.auth.signOut();
    toast({
      title: t("تم تسجيل الخروج", "Signed out"),
      description: t("تم إنهاء الجلسة الحالية.", "You have successfully ended your session."),
    });
    router.replace("/login");
  }

  const NavigationList = ({
    layout,
  }: {
    layout: "vertical" | "compact";
  }) => (
    <TabsList
      className={
        layout === "vertical"
          ? "flex h-full flex-col gap-2 rounded-3xl border-0 bg-transparent p-0"
          : "grid w-full grid-cols-1 gap-2 rounded-3xl border-0 bg-transparent"
      }
    >
      {navItems.map((item) => {
        const Icon = NAV_ICONS[item.key];
        return (
          <TabsTrigger
            key={item.key}
            value={item.key}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-muted/40 px-4 py-3 text-start text-sm font-medium text-muted-foreground transition focus-visible:ring-2 data-[state=active]:border-primary/60 data-[state=active]:bg-primary/10 data-[state=active]:text-foreground"
            onClick={() => setNavOpen(false)}
          >
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition group-data-[state=active]:bg-primary/15 group-data-[state=active]:text-primary">
                <Icon className="size-5 rtl:flip" aria-hidden />
              </span>
              <span className="flex flex-col text-start">
                <span className="text-base font-semibold">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </span>
            {item.badge}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );

  return (
    <Tabs
      dir={direction}
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabKey)}
      className="flex min-h-[100dvh] flex-col"
    >
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <header
          ref={headerRef}
          className="sticky top-0 z-50 border-b border-border/60 bg-background/80 px-safe pt-safe-t pb-3 shadow-[0_16px_40px_-32px_hsl(var(--shadow-soft))] backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label={t("فتح القائمة", "Open navigation")}
                >
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {t("منصة التدقيق", "Audit workspace")}
                </span>
                <h1 className="text-lg font-semibold text-foreground sm:text-2xl">
                  SanadGPT
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border/70 bg-background/80 px-4"
                    aria-label={t("إعدادات الحساب", "Account settings")}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                        {email?.[0]?.toUpperCase() ?? "U"}
                      </span>
                      <span className="hidden sm:inline text-start">
                        {email ?? t("مستخدم", "User")}
                      </span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {email ?? t("مستخدم", "User")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === "ar"
                          ? "مساحة عمل SanadGPT"
                          : "SanadGPT workspace"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive"
                    onSelect={logout}
                  >
                    <LogOut className="size-4 rtl:flip" aria-hidden />
                    {t("تسجيل الخروج", "Sign out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <SheetContent side={direction === "rtl" ? "end" : "start"}>
          <SheetHeader>
            <SheetTitle>{t("التنقل", "Navigation")}</SheetTitle>
            <SheetDescription>
              {t("اختر القسم الذي ترغب بالعمل عليه.", "Choose where you’d like to work today.")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            <NavigationList layout="compact" />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside
          className="relative hidden w-full max-w-xs flex-none border-border/60 lg:block lg:border-e lg:sticky"
          style={asideStyle}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 pb-10 pt-8 scrollbar-thin">
              <NavigationList layout="vertical" />
            </div>
          </div>
        </aside>

        <main className="flex-1 px-safe pb-safe-b pt-8">
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <span className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-5 py-3 text-sm font-medium text-muted-foreground shadow-soft">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("جاري التحقق من الجلسة...", "Validating your session...")}
              </span>
            </div>
          ) : (
            <div className="space-y-10">
              <TabsContent value="chat" className="m-0">
                <SectionWrapper
                  title={t("محادثة الذكاء الاصطناعي", "AI workspace chat")}
                  description={t(
                    "تفاعل مع المحتوى المعتمد واطلب ما تحتاجه مباشرة.",
                    "Collaborate with your content and get crisp answers."
                  )}
                >
                  <ChatInterface />
                </SectionWrapper>
              </TabsContent>

              <TabsContent value="upload" className="m-0">
                <SectionWrapper
                  title={t("رفع المستندات", "Upload documents")}
                  description={t(
                    "ارفع ملفات جديدة وستتم معالجتها وتوجيهها تلقائياً.",
                    "Bring new evidence into the workspace for automated processing."
                  )}
                >
                  <DocumentUpload />
                </SectionWrapper>
              </TabsContent>

              <TabsContent value="documents" className="m-0">
                <SectionWrapper
                  title={t("أرشيف المستندات", "Document archive")}
                  description={t(
                    "استعرض كل الملفات وتتبّع حالة التحميل والمعالجة.",
                    "Monitor upload progress and review archived documents."
                  )}
                >
                  <DocumentsList />
                </SectionWrapper>
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="m-0">
                  <SectionWrapper
                    title={t("لوحة الإدارة", "Administrative console")}
                    description={t(
                      "استعرض المؤشرات الحيوية للنظام وأدِر المستخدمين.",
                      "Review system vitals and manage workspace governance."
                    )}
                  >
                    <AdminDashboard />
                  </SectionWrapper>
                </TabsContent>
              )}
            </div>
          )}
        </main>
      </div>
    </Tabs>
  );
}

function SectionWrapper({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
      <div className="space-y-1 text-start">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-surface/80 p-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}
