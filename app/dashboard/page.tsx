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
import styles from "./dashboard-layout.module.css";

type TabKey = "chat" | "upload" | "documents" | "admin";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerOffsetRem, setHeaderOffsetRem] = useState(0);
  const t = useI18n();
  const { direction } = useLanguage();
  const textAlign = direction === "rtl" ? "text-right" : "text-left";
  const isRtl = direction === "rtl";

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
    const mediaQuery = window.matchMedia("(min-width: 60em)");

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
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize || "16"
      );
      const measuredRem = element.getBoundingClientRect().height / rootFontSize;
      setHeaderOffsetRem(measuredRem);
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

  const drawerPlacementStyle: CSSProperties = useMemo(() => {
    const hiddenTransform = isRtl ? "translateX(100%)" : "translateX(-100%)";
    return {
      transform: isSidebarOpen ? "translateX(0)" : hiddenTransform,
      pointerEvents: isSidebarOpen ? "auto" : "none",
      ...(isRtl ? { right: "0" } : { left: "0" }),
    } satisfies CSSProperties;
  }, [isRtl, isSidebarOpen]);

  const layoutVariables = useMemo(
    () => ({ "--header-offset": `${headerOffsetRem}rem` } satisfies CSSProperties),
    [headerOffsetRem]
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
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"
        style={topBarStyle}
      >
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className={`${styles.mobileToggle} h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
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

      <div className={styles.rootMain} style={layoutVariables}>
        {isSidebarOpen && (
          <button
            type="button"
            aria-label={t("إغلاق قائمة التنقل", "Close navigation")}
            className={styles.mobileBackdrop}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`${styles.mobileDrawer} border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900`}
          style={{ ...drawerSafeAreaStyle, ...drawerPlacementStyle }}
          aria-hidden={!isSidebarOpen}
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
          <nav className="flex flex-col gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
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
          className={`${styles.desktopSidebar} relative rounded-xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/85`}
        >
          <div className={`${styles.desktopSidebarScrollable} ${styles.desktopSidebarContent}`}>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {t("التنقل", "Navigation")}
            </div>
            <nav>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
          </div>
        </aside>

        <main className={`${styles.mainColumn} w-full`}>
          <div
            className="mx-auto flex w-full flex-col gap-6"
            style={{ maxWidth: "min(64rem, 100%)" }}
          >
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
