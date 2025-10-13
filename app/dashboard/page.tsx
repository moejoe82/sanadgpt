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
  ChevronDown,
  User,
  Mail,
  Lock,
  Edit,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
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
        description: t(
          "اسأل النظام واحصل على إجابات فورية.",
          "Ask the workspace for instant insights."
        ),
      },
      {
        key: "upload",
        label: t("رفع", "Upload"),
        description: t(
          "أضف مستندات جديدة إلى مساحة العمل.",
          "Bring new documents into the workspace."
        ),
      },
      {
        key: "documents",
        label: t("المستندات", "Documents"),
        description: t(
          "استعرض الملفات المؤرشفة وتحقق من حالتها.",
          "Review and track uploaded records."
        ),
      },
    ];

    if (isAdmin) {
      base.push({
        key: "admin",
        label: t("الإدارة", "Admin"),
        description: t(
          "مقاييس النظام وإدارة المستخدمين.",
          "System metrics and controls."
        ),
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen) {
        const target = event.target as Element;
        if (!target.closest("[data-user-menu]")) {
          setUserMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  async function logout() {
    await supabase.auth.signOut();
    toast({
      title: t("تم تسجيل الخروج", "Signed out"),
      description: t(
        "تم إنهاء الجلسة الحالية.",
        "You have successfully ended your session."
      ),
    });
    router.replace("/login");
  }

  const NavigationList = ({ layout }: { layout: "vertical" | "compact" }) => (
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
          >
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition group-data-[state=active]:bg-primary/15 group-data-[state=active]:text-primary">
                <Icon className="size-5 rtl:flip" aria-hidden />
              </span>
              <span className="flex flex-col text-start">
                <span className="text-base font-semibold">{item.label}</span>
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
      onValueChange={(value) => {
        setActiveTab(value as TabKey);
        setNavOpen(false); // Close mobile navigation when tab changes
      }}
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

              {/* User Avatar Menu */}
              <div className="relative" data-user-menu>
                {/* Initial Avatar Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-full p-0 hover:bg-transparent"
                  aria-label={t("إعدادات الحساب", "Account settings")}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                    {email?.[0]?.toUpperCase() ?? "U"}
                  </span>
                </Button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="flex items-center gap-3">
                      {/* Bigger Avatar */}
                      <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary text-lg font-semibold">
                        {email?.[0]?.toUpperCase() ?? "U"}
                      </span>

                      {/* Email + Chevron */}
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">
                          {email ?? t("مستخدم", "User")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {language === "ar"
                            ? "مساحة عمل SanadGPT"
                            : "SanadGPT workspace"}
                        </div>
                      </div>

                      {/* Chevron Arrow */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProfileModalOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className="rounded-full p-2 hover:bg-muted/50"
                        aria-label={t("فتح الملف الشخصي", "Open profile")}
                      >
                        <ChevronDown className="size-4 rtl:flip" aria-hidden />
                      </Button>
                    </div>

                    {/* Sign Out Button */}
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="w-full rounded-full border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <LogOut className="size-4 rtl:flip me-2" aria-hidden />
                        {t("تسجيل الخروج", "Sign out")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <SheetContent side={direction === "rtl" ? "end" : "start"}>
          <SheetHeader>
            <SheetTitle>{t("التنقل", "Navigation")}</SheetTitle>
            <SheetDescription>
              {t(
                "اختر القسم الذي ترغب بالعمل عليه.",
                "Choose where you’d like to work today."
              )}
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
            <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 pb-10 scrollbar-thin">
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
                <ChatInterface />
              </TabsContent>

              <TabsContent value="upload" className="m-0">
                <DocumentUpload />
              </TabsContent>

              <TabsContent value="documents" className="m-0">
                <DocumentsList />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="m-0">
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
                    <AdminDashboard />
                  </div>
                </TabsContent>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto my-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t("الملف الشخصي", "User Profile")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Large Avatar */}
            <div className="flex justify-center">
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary text-2xl font-semibold">
                {email?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("الاسم", "Name")}
                </label>
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={t("أدخل اسمك", "Enter your name")}
                    className="flex-1 min-w-0 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg flex-shrink-0 font-semibold"
                  >
                    <Edit className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("البريد الإلكتروني", "Email")}
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="email"
                    value={email ?? ""}
                    disabled
                    className="flex-1 min-w-0 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg flex-shrink-0 font-semibold"
                    disabled
                  >
                    <Edit className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Password Management */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("إدارة كلمة المرور", "Password Management")}
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-muted-foreground flex-shrink-0" />
                  <Button
                    variant="outline"
                    className="flex-1 justify-start rounded-lg"
                    disabled
                  >
                    {t("إضافة كلمة مرور", "Add Password")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "للمستخدمين الذين سجلوا عبر Google",
                    "For users who signed up via Google"
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl px-6 py-3 text-sm font-medium"
                onClick={() => setProfileModalOpen(false)}
              >
                {t("إلغاء", "Cancel")}
              </Button>
              <Button
                className="flex-1 rounded-xl px-6 py-3 text-sm font-medium"
                disabled
              >
                {t("حفظ التغييرات", "Save Changes")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
