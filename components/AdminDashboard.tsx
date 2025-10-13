"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Files,
  RefreshCw,
  Trash2,
  Users,
  ShieldCheck,
  Loader2,
  BarChart3,
  Settings,
} from "lucide-react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatusIds, setCheckingStatusIds] = useState<Set<string>>(
    new Set()
  );
  const [syncingDocuments, setSyncingDocuments] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const t = useI18n();
  const { direction } = useLanguage();

  // Detect narrow screen for responsive tabs
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsNarrowScreen(window.innerWidth < 640); // sm breakpoint
    };

    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

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
      toast({
        title: t("تعذّر تحميل البيانات", "Analytics unavailable"),
        description: t(
          "تحقق من الاتصال وأعد المحاولة.",
          "Check connectivity and retry."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  async function deleteDocument(id: string) {
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
      toast({
        title: t("تم حذف المستند", "Document deleted"),
        description: t(
          "تمت إزالة المستند من مساحة العمل بنجاح.",
          "The document has been removed successfully."
        ),
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: t("تعذّر حذف المستند", "Delete failed"),
        description:
          error instanceof Error
            ? error.message
            : t("حدث خطأ غير متوقع.", "Unexpected error."),
        variant: "destructive",
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
        await loadAnalytics();
        const summary = data.summary || {};
        toast({
          title: t("تمت المزامنة", "Documents synced"),
          description: `${t("إجمالي", "Total")}: ${summary.total ?? 0} • ${t(
            "جاهز",
            "Ready"
          )}: ${summary.ready ?? 0}`,
        });
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing documents:", error);
      toast({
        title: t("تعذّر المزامنة", "Sync failed"),
        description:
          error instanceof Error
            ? error.message
            : t("حدث خطأ غير متوقع.", "Unexpected error."),
        variant: "destructive",
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
          prev.map((doc) =>
            doc.id === id ? { ...doc, status: newStatus } : doc
          )
        );
        toast({
          title: t("تم تحديث الحالة", "Status refreshed"),
          description: t(
            newStatus === "ready"
              ? "المستند جاهز الآن."
              : newStatus === "failed"
              ? "فشلت معالجة المستند."
              : "المستند لا يزال قيد المعالجة.",
            newStatus === "ready"
              ? "Document is ready."
              : newStatus === "failed"
              ? "Processing failed."
              : "Document is still processing."
          ),
        });
      } else {
        toast({
          title: t("لا يوجد تحديث", "No update"),
          description: t(
            "لا توجد حالة جديدة لهذا المستند.",
            "No new status is available for this document."
          ),
        });
      }
    } catch (error) {
      toast({
        title: t("تعذّر فحص الحالة", "Status check failed"),
        description:
          error instanceof Error
            ? error.message
            : t("حدث خطأ غير متوقع.", "Unexpected error."),
        variant: "destructive",
      });
    } finally {
      setCheckingStatusIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const stats = useMemo(
    () => [
      {
        title: t("إجمالي المستندات", "Total documents"),
        value: analytics?.totalDocuments ?? 0,
        icon: Files,
      },
      {
        title: t("جاهز", "Ready"),
        value: analytics?.documentsByStatus.ready ?? 0,
        icon: CheckCircle2,
      },
      {
        title: t("قيد المعالجة", "Processing"),
        value: analytics?.documentsByStatus.processing ?? 0,
        icon: RefreshCw,
      },
      {
        title: t("المستخدمون", "Users"),
        value: analytics?.totalUsers ?? 0,
        icon: Users,
      },
    ],
    [analytics, t]
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-5 py-3 text-sm font-medium text-muted-foreground shadow-soft">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t("جاري تحميل لوحة التحكم...", "Loading admin console...")}
        </span>
      </div>
    );
  }

  return (
    <Tabs
      dir={direction}
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={loadAnalytics}
          className="rounded-full"
        >
          <RefreshCw className="me-2 size-4 rtl:flip" aria-hidden />
          {t("تحديث", "Refresh")}
        </Button>
        <Button
          size="sm"
          className="rounded-full"
          onClick={syncDocumentsFromOpenAI}
          disabled={syncingDocuments}
        >
          {syncingDocuments ? (
            <Loader2
              className="me-2 size-4 animate-spin rtl:flip"
              aria-hidden
            />
          ) : (
            <ShieldCheck className="me-2 size-4 rtl:flip" aria-hidden />
          )}
          {syncingDocuments
            ? t("جاري المزامنة", "Syncing...")
            : t("مزامنة من OpenAI", "Sync from OpenAI")}
        </Button>
      </div>

      {/* Responsive Tabs */}
      <TabsList className={`flex rounded-full bg-muted/60 p-1 ${
        isNarrowScreen ? "w-fit mx-auto gap-0.5" : "w-full gap-1"
      }`}>
        <TabsTrigger
          value="overview"
          className={`rounded-full text-sm ${
            isNarrowScreen ? "p-1.5 min-w-0" : "flex-1 px-3 py-2"
          }`}
          title={isNarrowScreen ? t("نظرة عامة", "Overview") : undefined}
        >
          {isNarrowScreen ? (
            <BarChart3 className="size-3.5" />
          ) : (
            t("نظرة عامة", "Overview")
          )}
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className={`rounded-full text-sm ${
            isNarrowScreen ? "p-1.5 min-w-0" : "flex-1 px-3 py-2"
          }`}
          title={isNarrowScreen ? t("المستندات", "Documents") : undefined}
        >
          {isNarrowScreen ? (
            <Files className="size-3.5" />
          ) : (
            t("المستندات", "Documents")
          )}
        </TabsTrigger>
        <TabsTrigger
          value="users"
          className={`rounded-full text-sm ${
            isNarrowScreen ? "p-1.5 min-w-0" : "flex-1 px-3 py-2"
          }`}
          title={isNarrowScreen ? t("المستخدمون", "Users") : undefined}
        >
          {isNarrowScreen ? (
            <Users className="size-3.5" />
          ) : (
            t("المستخدمون", "Users")
          )}
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className={`rounded-full text-sm ${
            isNarrowScreen ? "p-1.5 min-w-0" : "flex-1 px-3 py-2"
          }`}
          title={isNarrowScreen ? t("الإعدادات", "Settings") : undefined}
        >
          {isNarrowScreen ? (
            <Settings className="size-3.5" />
          ) : (
            t("الإعدادات", "Settings")
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="m-0 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="border border-border/60 bg-background/80 shadow-soft"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon
                  className="size-5 text-primary rtl:flip"
                  aria-hidden
                />
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-semibold text-foreground">
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-border/60 bg-background/80 shadow-soft">
            <CardHeader>
              <CardTitle>{t("آخر المستندات", "Recent documents")}</CardTitle>
              <CardDescription>
                {t(
                  "أحدث الملفات التي تم رفعها إلى النظام.",
                  "The latest files ingested into the workspace."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.recentUploads.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {doc.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.uploaded_at, direction)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      doc.status === "ready"
                        ? "success"
                        : doc.status === "failed"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
              {analytics?.recentUploads.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("لا يوجد نشاط حديث", "No recent uploads")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-background/80 shadow-soft">
            <CardHeader>
              <CardTitle>{t("المستخدمون النشطون", "Active users")}</CardTitle>
              <CardDescription>
                {t(
                  "آخر من تفاعل مع النظام.",
                  "Most recent workspace activity."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.last_sign_in_at
                        ? formatDate(user.last_sign_in_at, direction)
                        : t("لم يسجل دخول", "Never signed in")}
                    </p>
                  </div>
                  <Badge variant="outline">{t("نشط", "Active")}</Badge>
                </div>
              ))}
              {analytics?.activeUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("لا يوجد نشاط حديث", "No recent activity")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="m-0">
        <div className="rounded-3xl border border-border/60 bg-background/70 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
          <div className="p-6">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("لا توجد مستندات مسجلة", "No documents available")}
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  {t(
                    "سيظهر كل مستند يتم رفعه هنا مع حالة معالجته.",
                    "Every document uploaded will appear here with processing status."
                  )}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {documents.map((doc) => {
                  const date = new Date(doc.uploaded_at);
                  const formattedDate = new Intl.DateTimeFormat(
                    languageToLocale(direction),
                    {
                      dateStyle: "medium",
                    }
                  ).format(date);

                  return (
                    <Card
                      key={doc.id}
                      className="group flex flex-col border border-border/60 bg-background/80 shadow-soft min-h-0"
                    >
                      <CardHeader className="gap-2 p-4 pb-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold text-foreground break-words line-clamp-2 leading-tight">
                              {doc.title || "Document"}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={
                              doc.status === "ready"
                                ? "success"
                                : doc.status === "failed"
                                ? "destructive"
                                : "outline"
                            }
                            className="flex-shrink-0 text-xs px-2 py-1"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted/50 px-2 py-1">
                            {t("رفع", "Uploaded")} • {formattedDate}
                          </span>
                          {doc.emirate_scope && (
                            <span className="rounded-full bg-muted/50 px-2 py-1">
                              {doc.emirate_scope}
                            </span>
                          )}
                          {doc.authority_name && (
                            <span className="rounded-full bg-muted/50 px-2 py-1">
                              {doc.authority_name}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="border-t border-border/60 bg-background/70 p-4 pt-3 mt-auto">
                        <div className="flex flex-col gap-2">
                          {doc.status === "processing" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => checkDocumentStatus(doc.id)}
                              disabled={checkingStatusIds.has(doc.id)}
                              className="w-full rounded-xl text-xs"
                            >
                              {checkingStatusIds.has(doc.id)
                                ? t("جارٍ الفحص", "Checking")
                                : t("فحص الحالة", "Check status")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDocument(doc.id)}
                            className="w-full rounded-xl text-xs"
                          >
                            <Trash2
                              className="me-2 size-3 rtl:flip"
                              aria-hidden
                            />
                            {t("حذف", "Delete")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="users" className="m-0">
        <div className="rounded-3xl border border-border/60 bg-background/70 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
          <div className="p-6">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("لا يوجد مستخدمون", "No users found")}
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  {t(
                    "سيظهر كل مستخدم مسجل هنا مع تفاصيل تسجيله.",
                    "Every registered user will appear here with registration details."
                  )}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {users.map((user) => {
                  const date = new Date(user.created_at);
                  const formattedDate = new Intl.DateTimeFormat(
                    languageToLocale(direction),
                    {
                      dateStyle: "medium",
                    }
                  ).format(date);

                  return (
                    <Card
                      key={user.id}
                      className="group flex flex-col border border-border/60 bg-background/80 shadow-soft min-h-0"
                    >
                      <CardHeader className="gap-2 p-4 pb-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold text-foreground break-words line-clamp-2 leading-tight">
                              {user.email}
                            </CardTitle>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                              {user.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted/50 px-2 py-1">
                            {t("انضم في", "Joined")} • {formattedDate}
                          </span>
                          {user.last_sign_in_at && (
                            <span className="rounded-full bg-muted/50 px-2 py-1">
                              {t("آخر دخول", "Last sign-in")} •{" "}
                              {formatDate(user.last_sign_in_at, direction)}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="border-t border-border/60 bg-background/70 p-4 pt-3 mt-auto">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="rounded-full text-xs px-3 py-1"
                          >
                            {t("مستخدم نشط", "Active user")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="m-0 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border/60 bg-background/80 shadow-soft">
            <CardHeader>
              <CardTitle>
                {t("إعدادات OpenAI", "OpenAI configuration")}
              </CardTitle>
              <CardDescription>
                {t(
                  "معلومات المخزن حول التكامل الحالي.",
                  "Integration values for the current vector store."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-xs font-medium">
                  {t("معرّف المخزن", "Vector store ID")}
                </span>
                <code className="rounded-full bg-muted/50 px-3 py-1 text-xs break-all">
                  {settings?.openaiVectorStoreId || "..."}
                </code>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-xs font-medium">
                  {t("حالة المفتاح", "API key status")}
                </span>
                <Badge variant="outline" className="w-fit">
                  {settings?.openaiApiKeyStatus || "..."}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-background/80 shadow-soft">
            <CardHeader>
              <CardTitle>
                {t("إعدادات Supabase", "Supabase configuration")}
              </CardTitle>
              <CardDescription>
                {t(
                  "تفاصيل الاتصال بقاعدة البيانات الموثوقة.",
                  "Secure database connection details."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-xs font-medium">
                  {t("عنوان المشروع", "Project URL")}
                </span>
                <code className="rounded-full bg-muted/50 px-3 py-1 text-xs break-all">
                  {settings?.supabaseUrl || "..."}
                </code>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-xs font-medium">
                  {t("مفتاح الوصول", "Anon key")}
                </span>
                <code className="rounded-full bg-muted/50 px-3 py-1 text-xs break-all">
                  {settings?.supabaseAnonKey?.slice(0, 6)}•••
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border/60 bg-background/80 shadow-soft">
          <CardHeader>
            <CardTitle>{t("صحة النظام", "System health")}</CardTitle>
            <CardDescription>
              {t(
                "نظرة عامة مختصرة على التشغيل الحالي.",
                "Snapshot of current operational posture."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">
                {t("إجمالي المستندات", "Documents total")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {analytics?.totalDocuments ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">
                {t("نسبة الجاهز", "Ready ratio")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {analytics?.totalDocuments
                  ? Math.round(
                      ((analytics.documentsByStatus.ready || 0) /
                        analytics.totalDocuments) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">
                {t("المستخدمون", "Users")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {analytics?.totalUsers ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function formatDate(value: string, direction: "rtl" | "ltr") {
  const locale = direction === "rtl" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function languageToLocale(direction: "rtl" | "ltr") {
  return direction === "rtl" ? "ar-EG" : "en-US";
}
