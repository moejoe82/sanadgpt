"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Badge,
  Button,
  Input,
  SurfaceCard,
  Textarea,
  type ToastPayload,
} from "@/components/ui/primitives";

import styles from "./admin-dashboard.module.css";

interface Document {
  id: string;
  title: string;
  file_path: string;
  status: string;
  uploaded_at: string;
  emirate_scope?: string;
  authority_name?: string;
  openai_file_id?: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface Analytics {
  totalDocuments: number;
  totalUsers: number;
  documentsByStatus: Record<string, number>;
  recentUploads: Document[];
  activeUsers: User[];
}

interface Settings {
  openaiVectorStoreId: string;
  openaiApiKeyStatus: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

interface AdminDashboardProps {
  onToast?: (toast: ToastPayload) => void;
}

export default function AdminDashboard({ onToast }: AdminDashboardProps) {
  const t = useI18n();
  const { direction } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingDocuments, setSyncingDocuments] = useState(false);
  const [checkingStatusIds, setCheckingStatusIds] = useState<Set<string>>(new Set());

  const tabs = useMemo(
    () => [
      { id: "overview", label: t("نظرة عامة", "Overview") },
      { id: "documents", label: t("المستندات", "Documents") },
      { id: "users", label: t("المستخدمون", "Users") },
      { id: "settings", label: t("الإعدادات", "Settings") },
    ],
    [t]
  );

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) {
        throw new Error("Failed to load analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      setDocuments(data.documents);
      setUsers(data.users);
      setSettings(data.settings);
    } catch (error) {
      console.error("Error loading analytics:", error);
      onToast?.({
        title: t("تعذر تحميل لوحة الإدارة", "Unable to load admin data"),
        description:
          error instanceof Error ? error.message : t("خطأ غير معروف", "Unknown error"),
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [onToast, t]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  async function deleteDocument(id: string, title: string) {
    if (!confirm(`${t("حذف المستند؟", "Delete document?")}\n${title}`)) return;

    try {
      const response = await fetch("/api/documents/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      onToast?.({
        title: t("تم حذف المستند", "Document deleted"),
        description: title,
        tone: "success",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      onToast?.({
        title: t("تعذر حذف المستند", "Could not delete document"),
        description: error instanceof Error ? error.message : String(error),
        tone: "error",
      });
    }
  }

  async function syncDocumentsFromOpenAI() {
    setSyncingDocuments(true);
    try {
      const response = await fetch("/api/admin/sync-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync documents");
      }

      const data = await response.json();

      if (data.success) {
        const summary = data.summary || {};
        const total = summary.total || data.documents?.length || 0;
        const ready = summary.ready || 0;
        const processing = summary.processing || 0;

        onToast?.({
          title: t("اكتملت المزامنة", "Sync complete"),
          description: `${t("الإجمالي", "Total")}: ${total} • ${t("جاهز", "Ready")}: ${ready} • ${t(
            "قيد المعالجة",
            "Processing"
          )}: ${processing}`,
          tone: "success",
        });
        loadAnalytics();
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing documents:", error);
      onToast?.({
        title: t("فشل في المزامنة", "Sync failed"),
        description: error instanceof Error ? error.message : String(error),
        tone: "error",
      });
    } finally {
      setSyncingDocuments(false);
    }
  }

  async function checkDocumentStatus(id: string) {
    setCheckingStatusIds((prev) => new Set(prev).add(id));
    try {
      const resp = await fetch("/api/documents/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: [id] }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Status check failed");
      }

      const data = await resp.json();
      const newStatus = data?.statuses?.[id];

      if (newStatus) {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? { ...doc, status: newStatus } : doc))
        );
        onToast?.({
          title: t("تم تحديث الحالة", "Status updated"),
          description: newStatus,
          tone: "success",
        });
      } else {
        onToast?.({
          title: t("لا يوجد تحديث", "No update"),
          description: t("لم تتغير حالة المستند.", "Document status did not change."),
        });
      }
    } catch (error) {
      onToast?.({
        title: t("تعذر فحص الحالة", "Unable to check status"),
        description: error instanceof Error ? error.message : String(error),
        tone: "error",
      });
    } finally {
      setCheckingStatusIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const heading = useMemo(() => {
    switch (activeTab) {
      case "documents":
        return t("إدارة المستندات", "Document management");
      case "users":
        return t("إدارة المستخدمين", "User management");
      case "settings":
        return t("إعدادات النظام", "System settings");
      default:
        return t("لوحة الإدارة", "Admin Dashboard");
    }
  }, [activeTab, t]);

  return (
    <div className={styles.dashboard} dir={direction}>
      <SurfaceCard className={styles.header} role="region" aria-label={t("رأس لوحة الإدارة", "Admin header")}>
        <div>
          <h2 className={styles.sectionHeading}>{heading}</h2>
          <p className={styles.subtle}>
            {t(
              "إدارة نظام SanadGPT والتحكم في المستندات والمستخدمين.",
              "Manage SanadGPT content and configuration."
            )}
          </p>
        </div>
        <nav className={styles.tabNavigation} aria-label={t("أقسام لوحة الإدارة", "Admin sections")}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={styles.tabButton}
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </SurfaceCard>

      {loading ? (
        <SurfaceCard role="status" aria-busy="true">
          {t("جاري تحميل بيانات الإدارة...", "Loading admin data...")}
        </SurfaceCard>
      ) : null}

      {!loading && activeTab === "overview" && analytics ? (
        <div className={styles.sectionStack}>
          <SurfaceCard>
            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{analytics.totalDocuments}</span>
                <span className={styles.statLabel}>{t("إجمالي المستندات", "Total documents")}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>
                  {analytics.documentsByStatus.ready || 0}
                </span>
                <span className={styles.statLabel}>{t("مستندات جاهزة", "Ready documents")}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>
                  {analytics.documentsByStatus.processing || 0}
                </span>
                <span className={styles.statLabel}>{t("قيد المعالجة", "Processing")}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{analytics.totalUsers}</span>
                <span className={styles.statLabel}>{t("إجمالي المستخدمين", "Total users")}</span>
              </div>
            </div>
          </SurfaceCard>

          <div className={styles.twoColumn}>
            <SurfaceCard className={styles.listCard}>
              <div className={styles.actionsBar}>
                <h3 className={styles.sectionHeading}>{t("آخر المستندات", "Recent documents")}</h3>
                <Badge>{t("أحدث", "Recent")}</Badge>
              </div>
              {analytics.recentUploads.length === 0 ? (
                <div className={styles.emptyState}>{t("لا يوجد رفع حديث", "No recent uploads")}</div>
              ) : (
                analytics.recentUploads.map((doc) => {
                  const tone = (doc.status ?? "").toLowerCase();
                  return (
                    <div key={doc.id} className={styles.listItem}>
                      <div className={styles.listItemHeader}>
                        <span className={styles.listItemTitle}>{doc.title}</span>
                        <span
                          className={styles.badge}
                          data-tone={tone === "ready" || tone === "processing" || tone === "failed" ? tone : undefined}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <div className={styles.listItemMeta}>
                        <span>{new Date(doc.uploaded_at).toLocaleString()}</span>
                        {doc.emirate_scope ? (
                          <span>
                            {t("النطاق", "Emirate")} • {doc.emirate_scope}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </SurfaceCard>
            <SurfaceCard className={styles.listCard}>
              <div className={styles.actionsBar}>
                <h3 className={styles.sectionHeading}>{t("المستخدمون النشطون", "Active users")}</h3>
                <Badge>{t("نشط", "Active")}</Badge>
              </div>
              {analytics.activeUsers.length === 0 ? (
                <div className={styles.emptyState}>{t("لا يوجد مستخدمون نشطون", "No active users")}</div>
              ) : (
                analytics.activeUsers.map((user) => (
                  <div key={user.id} className={styles.listItem}>
                    <div className={styles.listItemHeader}>
                      <span className={styles.listItemTitle}>{user.email}</span>
                    </div>
                    <div className={styles.listItemMeta}>
                      <span>
                        {t("آخر تسجيل", "Last sign-in")}: {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleString()
                          : t("لم يسجل دخول", "Never")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </SurfaceCard>
          </div>
        </div>
      ) : null}

      {!loading && activeTab === "documents" ? (
        <SurfaceCard className={styles.sectionStack}>
          <div className={styles.actionsBar}>
            <h3 className={styles.sectionHeading}>{t("إدارة المستندات", "Document management")}</h3>
            <div className={styles.actionRow}>
              <Button onClick={syncDocumentsFromOpenAI} disabled={syncingDocuments}>
                {syncingDocuments
                  ? t("جاري المزامنة...", "Syncing...")
                  : t("مزامنة من OpenAI", "Sync from OpenAI")}
              </Button>
              <Button onClick={loadAnalytics} variant="secondary">
                {t("تحديث", "Refresh")}
              </Button>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table} aria-label={t("جدول المستندات", "Documents table")}>
              <thead>
                <tr>
                  <th scope="col">{t("العنوان", "Title")}</th>
                  <th scope="col">{t("الحالة", "Status")}</th>
                  <th scope="col">{t("الإمارة", "Emirate")}</th>
                  <th scope="col">{t("تاريخ الرفع", "Uploaded")}</th>
                  <th scope="col">{t("الإجراءات", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.title}</td>
                    <td>
                      <span
                        className={styles.badge}
                        data-tone={(() => {
                          const tone = (doc.status ?? "").toLowerCase();
                          return tone === "ready" || tone === "processing" || tone === "failed"
                            ? tone
                            : undefined;
                        })()}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td>{doc.emirate_scope || t("غير محدد", "Not specified")}</td>
                    <td>{new Date(doc.uploaded_at).toLocaleString()}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Button
                          variant="secondary"
                          onClick={() => checkDocumentStatus(doc.id)}
                          disabled={checkingStatusIds.has(doc.id)}
                        >
                          {checkingStatusIds.has(doc.id)
                            ? t("جاري الفحص...", "Checking...")
                            : t("فحص", "Check")}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => deleteDocument(doc.id, doc.title)}
                        >
                          {t("حذف", "Delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      ) : null}

      {!loading && activeTab === "users" ? (
        <SurfaceCard className={styles.sectionStack}>
          <h3 className={styles.sectionHeading}>{t("إدارة المستخدمين", "User management")}</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table} aria-label={t("جدول المستخدمين", "Users table")}>
              <thead>
                <tr>
                  <th scope="col">{t("البريد الإلكتروني", "Email")}</th>
                  <th scope="col">{t("تاريخ التسجيل", "Registered")}</th>
                  <th scope="col">{t("آخر تسجيل دخول", "Last sign-in")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : t("لم يسجل دخول", "Never")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      ) : null}

      {!loading && activeTab === "settings" && settings ? (
        <div className={styles.sectionStack}>
          <SurfaceCard className={styles.listCard}>
            <h3 className={styles.sectionHeading}>{t("إعدادات OpenAI", "OpenAI settings")}</h3>
            <div className={styles.listItem}>
              <label htmlFor="vector-store" className={styles.listItemTitle}>
                {t("معرف مخزن المتجهات", "Vector store ID")}
              </label>
              <Input id="vector-store" value={settings.openaiVectorStoreId} readOnly />
            </div>
            <div className={styles.listItem}>
              <label htmlFor="api-status" className={styles.listItemTitle}>
                {t("حالة مفتاح API", "API key status")}
              </label>
              <Input id="api-status" value={settings.openaiApiKeyStatus} readOnly />
            </div>
          </SurfaceCard>

          <SurfaceCard className={styles.listCard}>
            <h3 className={styles.sectionHeading}>{t("معلومات Supabase", "Supabase information")}</h3>
            <div className={styles.listItem}>
              <label htmlFor="supabase-url" className={styles.listItemTitle}>
                {t("عنوان URL", "URL")}
              </label>
              <Textarea id="supabase-url" value={settings.supabaseUrl} readOnly />
            </div>
            <div className={styles.listItem}>
              <label htmlFor="supabase-key" className={styles.listItemTitle}>
                {t("المفتاح العام", "Anon key")}
              </label>
              <Textarea id="supabase-key" value={settings.supabaseAnonKey} readOnly />
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </div>
  );
}
