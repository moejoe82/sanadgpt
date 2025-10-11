"use client";

import { useEffect, useMemo, useState } from "react";
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
  const t = useI18n();
  const { direction } = useLanguage();
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

  // Instead of early returns, render conditional UI blocks to preserve hooks order

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div dir={direction} className="min-h-screen flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/40 z-10">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-slate-600">
              {t("جاري التحميل...", "Loading...")}
            </div>
          </div>
        </div>
      )}
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/90 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">SanadGPT</div>
          <div className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
            v1.0.0
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`text-sm text-slate-700 dark:text-slate-300 ${textAlign}`}
          >
            {email || (loading ? "..." : "")}
          </div>
          <button
            onClick={logout}
            className="rounded-md bg-slate-900 text-white px-3 py-1.5 hover:bg-slate-800"
          >
            {t("خروج", "Logout")}
          </button>
        </div>
      </div>

      {/* Body with RTL sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`w-64 ${
            direction === "rtl" ? "border-l" : "border-r"
          } bg-white/90 dark:bg-slate-900/80 p-4 space-y-2`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                `w-full ${textAlign} rounded-md px-3 py-2 transition ` +
                (activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800")
              }
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-4 overflow-auto">
          {!email ? null : activeTab === "chat" ? <ChatInterface /> : null}
          {activeTab === "upload" && (
            <div className="max-w-2xl mx-auto">
              <DocumentUpload />
            </div>
          )}
          {activeTab === "documents" && <DocumentsList />}
          {activeTab === "admin" && <AdminDashboard />}
        </main>
      </div>
    </div>
  );
}
