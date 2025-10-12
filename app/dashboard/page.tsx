"use client";

import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AdminDashboard from "@/components/AdminDashboard";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentsList from "@/components/DocumentsList";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Badge,
  Button,
  NavButton,
  NavList,
  NavListItem,
  ToastStack,
  type ToastData,
  type ToastPayload,
  VisuallyHidden,
} from "@/components/ui/primitives";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { supabase } from "@/lib/supabase";

import styles from "./dashboard-layout.module.css";

type TabKey = "chat" | "upload" | "documents" | "admin";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const headerRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<Map<string, number>>(new Map());
  const [headerOffsetRem, setHeaderOffsetRem] = useState(0);
  const t = useI18n();
  const { direction } = useLanguage();
  const isRtl = direction === "rtl";

  useFocusTrap(isSidebarOpen, drawerRef, {
    onEscape: () => setIsSidebarOpen(false),
  });

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const emitToast = useCallback((toast: ToastPayload) => {
    const id = toast.id ?? crypto.randomUUID();
    const payload: ToastData = {
      id,
      title: toast.title,
      description: toast.description,
      tone: toast.tone,
    };
    setToasts((prev) => [...prev, payload]);
    const timeoutId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
      timersRef.current.delete(id);
    }, 6000);
    timersRef.current.set(id, timeoutId);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timeoutId = timersRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }
  }, []);

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
      } catch {
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
      document.documentElement.style.setProperty("overflow", "hidden");
    } else {
      document.documentElement.style.removeProperty("overflow");
    }

    return () => {
      document.documentElement.style.removeProperty("overflow");
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

  const headerPaddingStyle: CSSProperties = useMemo(
    () => ({
      paddingInlineStart: isRtl
        ? "calc(var(--header-inline-padding) + max(var(--safe-area-inset-right), 0rem))"
        : "calc(var(--header-inline-padding) + max(var(--safe-area-inset-left), 0rem))",
      paddingInlineEnd: isRtl
        ? "calc(var(--header-inline-padding) + max(var(--safe-area-inset-left), 0rem))"
        : "calc(var(--header-inline-padding) + max(var(--safe-area-inset-right), 0rem))",
    }),
    [isRtl]
  );

  const appAreaPaddingStyle: CSSProperties = useMemo(
    () => ({
      paddingInlineStart: isRtl
        ? "calc(var(--app-inline-padding) + max(var(--safe-area-inset-right), 0rem))"
        : "calc(var(--app-inline-padding) + max(var(--safe-area-inset-left), 0rem))",
      paddingInlineEnd: isRtl
        ? "calc(var(--app-inline-padding) + max(var(--safe-area-inset-left), 0rem))"
        : "calc(var(--app-inline-padding) + max(var(--safe-area-inset-right), 0rem))",
    }),
    [isRtl]
  );

  const sheetPlacementStyle: CSSProperties = useMemo(() => {
    const hiddenTransform = isRtl ? "translateX(100%)" : "translateX(-100%)";
    return {
      insetInlineStart: isRtl ? "auto" : "0",
      insetInlineEnd: isRtl ? "0" : "auto",
      transform: isSidebarOpen ? "translateX(0)" : hiddenTransform,
      opacity: isSidebarOpen ? 1 : 0,
      pointerEvents: isSidebarOpen ? "auto" : "none",
    } satisfies CSSProperties;
  }, [isRtl, isSidebarOpen]);

  const layoutVariables: CSSProperties = useMemo(
    () => ({ "--header-offset": `${headerOffsetRem}rem` } as CSSProperties),
    [headerOffsetRem]
  );

  const tabs = useMemo(() => {
    const base: { key: TabKey; label: string; description: string; icon: string }[] = [
      {
        key: "chat",
        label: t("المحادثة", "Chat"),
        description: t("تواصل مع مساعد SanadGPT.", "Talk with the SanadGPT assistant."),
        icon: "💬",
      },
      {
        key: "upload",
        label: t("رفع مستند", "Upload"),
        description: t("أضف وثائق جديدة للمنصة.", "Add new documents to the workspace."),
        icon: "⤴",
      },
      {
        key: "documents",
        label: t("المستندات", "Documents"),
        description: t("تصفح وأدر المستندات المرفوعة.", "Browse and manage uploaded files."),
        icon: "📁",
      },
    ];
    if (isAdmin)
      base.push({
        key: "admin",
        label: t("لوحة الإدارة", "Admin"),
        description: t("إحصاءات وإجراءات النظام.", "System insights and actions."),
        icon: "🛠",
      });
    return base;
  }, [isAdmin, t]);

  const activeTabLabel = useMemo(
    () => tabs.find((tab) => tab.key === activeTab)?.label ?? "",
    [activeTab, tabs]
  );

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("حدث خطأ غير متوقع.", "Unexpected error.");
      emitToast({
        title: t("تعذر تسجيل الخروج", "Unable to logout"),
        description: message,
        tone: "error",
      });
    }
  }, [emitToast, router, t]);

  return (
    <div dir={direction} className={styles.dashboard} style={layoutVariables}>
      {loading ? (
        <div className={styles.loadingOverlay} role="status" aria-live="polite">
          <div className={styles.loadingIndicator}>
            <div className={styles.loadingSpinner} aria-hidden />
            <div>{t("جاري التحميل...", "Loading dashboard...")}</div>
          </div>
        </div>
      ) : null}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <header ref={headerRef} className={styles.header} style={headerPaddingStyle}>
        <div className={styles.headerContent}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setIsSidebarOpen(true)}
            aria-expanded={isSidebarOpen}
            aria-controls="dashboard-navigation"
          >
            <VisuallyHidden>{t("فتح قائمة التنقل", "Open navigation")}</VisuallyHidden>
            <span aria-hidden>☰</span>
          </button>

          <div className={styles.brandBlock}>
            <span>SanadGPT</span>
            <Badge aria-label={t("الإصدار ١٫٠٫٠", "Version 1.0.0")}>v1.0.0</Badge>
          </div>

          <div className={styles.headerSpacer} />

          <div className={styles.headerMeta}>
            <span className={styles.headerEmail} title={email ?? undefined}>
              {email ?? ""}
            </span>
            <Button variant="secondary" onClick={handleLogout}>
              {t("خروج", "Logout")}
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.appArea} style={appAreaPaddingStyle}>
        <aside className={styles.desktopRail} aria-label={t("التنقل", "Navigation")}>
          <div className={styles.desktopRailInner} id="dashboard-navigation">
            <div className={styles.desktopRailHeader}>{t("التنقل", "Navigation")}</div>
            <NavList>
              {tabs.map((tab) => (
                <NavListItem key={tab.key}>
                  <NavButton
                    active={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    icon={tab.icon}
                  >
                    <span className={styles.navLabel}>
                      <span className={styles.navLabelTitle}>{tab.label}</span>
                      <span className={styles.navLabelDescription}>{tab.description}</span>
                    </span>
                  </NavButton>
                </NavListItem>
              ))}
            </NavList>
          </div>
        </aside>

        <main className={styles.mainColumn} role="main" aria-live="polite">
          <h1 className={styles.offscreenHeading}>{activeTabLabel}</h1>
          <div className={styles.sectionStack}>
            {activeTab === "chat" && <ChatInterface onToast={emitToast} />}
            {activeTab === "upload" && <DocumentUpload onToast={emitToast} />}
            {activeTab === "documents" && <DocumentsList onToast={emitToast} />}
            {activeTab === "admin" && <AdminDashboard onToast={emitToast} />}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          className={styles.sheetBackdrop}
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        ref={drawerRef}
        className={styles.sheet}
        style={sheetPlacementStyle}
        aria-hidden={!isSidebarOpen}
        aria-modal="true"
        role="dialog"
        aria-label={t("التنقل", "Navigation")}
      >
        <div className={styles.sheetHeader}>
          <div className={styles.sheetTitle}>{t("التنقل", "Navigation")}</div>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={() => setIsSidebarOpen(false)}
          >
            <VisuallyHidden>{t("إغلاق", "Close")}</VisuallyHidden>
            <span aria-hidden>×</span>
          </button>
        </div>
        <nav className={styles.sheetNav}>
          <NavList className={styles.sheetNavList}>
            {tabs.map((tab) => (
              <NavListItem key={tab.key}>
                <NavButton
                  active={activeTab === tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setIsSidebarOpen(false);
                  }}
                  icon={tab.icon}
                >
                  <span className={styles.navLabel}>
                    <span className={styles.navLabelTitle}>{tab.label}</span>
                    <span className={styles.navLabelDescription}>{tab.description}</span>
                  </span>
                </NavButton>
              </NavListItem>
            ))}
          </NavList>
        </nav>
      </aside>
    </div>
  );
}
