"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentsList from "@/components/DocumentsList";
import AdminDashboard from "@/components/AdminDashboard";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

type TabKey = "chat" | "upload" | "documents" | "admin";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const t = useI18n();
  const { direction, language, toggleLanguage } = useLanguage();
  const textAlign = direction === "rtl" ? "text-right" : "text-left";

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

      // Fetch user role - handle gracefully if table doesn't exist or has RLS issues
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Could not fetch user role:", error.message);
          // Temporary workaround: check if email is admin@sanadgpt.com
          if (user.email === "admin@sanadgpt.com") {
            console.log("Using email-based admin detection for:", user.email);
            setIsAdmin(true);
          }
        } else if (data?.role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.warn("Error fetching user role:", err);
        // Temporary workaround: check if email is admin@sanadgpt.com
        if (user.email === "admin@sanadgpt.com") {
          console.log("Using email-based admin detection for:", user.email);
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
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if ("matches" in event && event.matches) {
        setIsSidebarOpen(false);
      }
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isSidebarOpen) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const updateHeight = () => {
      setHeaderHeight(element.offsetHeight);
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

  const topBarStyle: CSSProperties = useMemo(
    () => ({
      paddingTop: "max(env(safe-area-inset-top), 0.75rem)",
      paddingBottom: "0.75rem",
      paddingInlineStart:
        direction === "rtl"
          ? "max(env(safe-area-inset-right), 1rem)"
          : "max(env(safe-area-inset-left), 1rem)",
      paddingInlineEnd:
        direction === "rtl"
          ? "max(env(safe-area-inset-left), 1rem)"
          : "max(env(safe-area-inset-right), 1rem)",
    }),
    [direction]
  );

  const drawerPositionClasses = useMemo(() => {
    const sideClass = direction === "rtl" ? "right-0" : "left-0";
    const closedTransform = direction === "rtl" ? "translate-x-full" : "-translate-x-full";
    return {
      container: `fixed inset-y-0 ${sideClass} z-40 w-72 max-w-full border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:hidden`,
      open: "translate-x-0",
      closed: closedTransform,
    };
  }, [direction]);

  const drawerSafeAreaStyle: CSSProperties = useMemo(
    () => ({
      paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
      paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
      paddingInlineStart:
        direction === "rtl"
          ? "calc(env(safe-area-inset-right) + 1rem)"
          : "calc(env(safe-area-inset-left) + 1rem)",
      paddingInlineEnd:
        direction === "rtl"
          ? "calc(env(safe-area-inset-left) + 1rem)"
          : "calc(env(safe-area-inset-right) + 1rem)",
    }),
    [direction]
  );

  const desktopSidebarStyle: CSSProperties = useMemo(
    () => ({
      top: 0, // Remove header height offset
      height: '100vh', // Full viewport height
      paddingTop: `${headerHeight}px`, // Use padding instead
    }),
    [headerHeight]
  );

  // Compute tabs BEFORE any conditional returns to keep hooks order stable
  const tabs = useMemo(() => {
    const base: { key: TabKey; label: string }[] = [
      { key: "chat", label: t("المحادثة", "Chat") },
      { key: "upload", label: t("رفع", "Upload") },
      { key: "documents", label: t("المستندات", "Documents") },
    ];
    if (isAdmin) base.push({ key: "admin", label: t("الإدارة", "Admin") });
    return base;
  }, [isAdmin, t]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div dir={direction} className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/40">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
            <div className="text-slate-600">{t("جاري التحميل...", "Loading...")}</div>
          </div>
        </div>
      )}

      <header
        ref={headerRef}
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-white/90 backdrop-blur dark:bg-slate-900/85"
        style={topBarStyle}
      >
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 md:hidden"
          aria-label={t("فتح قائمة التنقل", "Open navigation")}
        >
          <span className="sr-only">{t("القائمة", "Menu")}</span>
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-6 rounded-full bg-current" />
            <span className="block h-0.5 w-6 rounded-full bg-current" />
            <span className="block h-0.5 w-6 rounded-full bg-current" />
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">SanadGPT</div>
          <div className="rounded px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            v1.0.0
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3 text-sm">
          <div
            className={`min-w-0 flex-1 truncate text-slate-700 dark:text-slate-300 ${textAlign}`}
            title={email ?? undefined}
          >
            {email || (loading ? "..." : "")}
          </div>
          <button
            onClick={logout}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            {t("خروج", "Logout")}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label={t("إغلاق قائمة التنقل", "Close navigation")}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`${drawerPositionClasses.container} ${
            isSidebarOpen ? drawerPositionClasses.open : drawerPositionClasses.closed
          }`}
          style={drawerSafeAreaStyle}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {t("التنقل", "Navigation")}
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:bg-slate-900 dark:text-slate-200"
              aria-label={t("إغلاق", "Close")}
            >
              <span className="sr-only">{t("إغلاق", "Close")}</span>
              <span aria-hidden className="text-2xl leading-none">
                ×
              </span>
            </button>
          </div>
          
          {/* Language Toggle - Moved to top */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                toggleLanguage();
                setIsSidebarOpen(false);
              }}
              className={`w-full ${textAlign} text-sm font-bold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300 transition-colors`}
            >
              {language === "ar" ? "English" : "العربية"}
            </button>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.key);
                  setIsSidebarOpen(false);
                }}
                className={
                  `w-full ${textAlign} rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ` +
                  (activeTab === tab.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/70")
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <aside
          className={`${
            direction === "rtl" ? "md:border-l" : "md:border-r"
          } fixed ${direction === "rtl" ? "right-0" : "left-0"} hidden w-72 shrink-0 flex-col border-slate-200 bg-white/95 dark:bg-slate-900/85 md:flex overflow-hidden px-6 py-8`}
          style={desktopSidebarStyle}
        >
          {/* Language Toggle - Desktop sidebar */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={toggleLanguage}
              className={`w-full ${textAlign} text-sm font-bold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300 transition-colors`}
            >
              {language === "ar" ? "English" : "العربية"}
            </button>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.key);
                }}
                className={
                  `w-full ${textAlign} rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ` +
                  (activeTab === tab.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/70")
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className={`flex-1 min-w-0 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 md:px-8 md:pt-6 ${direction === "rtl" ? "md:mr-72" : "md:ml-72"}`}>
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 min-h-[calc(100vh-10rem)]">
            {!email ? null : activeTab === "chat" ? <ChatInterface /> : null}
            {activeTab === "upload" && (
              <div className="w-full">
                <DocumentUpload />
              </div>
            )}
            {activeTab === "documents" && <DocumentsList />}
            {activeTab === "admin" && <AdminDashboard />}
          </div>
        </main>
      </div>
    </div>
  );
}
