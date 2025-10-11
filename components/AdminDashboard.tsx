"use client";

import { useState, useEffect, useMemo } from "react";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
// Removed unused supabase import - now using API routes
// Updated for Vercel redeploy

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
  // Admin dashboard for managing documents and users
  // Force deployment with latest TypeScript fixes
  // Redeploy to pick up environment variables
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatusIds, setCheckingStatusIds] = useState<Set<string>>(new Set());
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";
  const reverseSpacing = direction === "rtl" ? "space-x-reverse" : "";

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Use API route instead of direct admin access
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
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

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

      // Reload data
      loadAnalytics();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const checkDocumentStatus = async (id: string) => {
    setCheckingStatusIds(prev => new Set(prev).add(id));
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
        // Update the document status in the local state
        setDocuments(prev => prev.map(doc => 
          doc.id === id ? { ...doc, status: newStatus } : doc
        ));
        
        if (newStatus === "ready") {
          alert(t("المستند جاهز الآن!", "Document is now ready!"));
        } else if (newStatus === "failed") {
          alert(t("فشل في معالجة المستند.", "Document processing failed."));
        } else {
          alert(t("المستند لا يزال قيد المعالجة.", "Document is still processing."));
        }
      } else {
        alert(t("لا يوجد تحديث للحالة متاح.", "No status update available."));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(`${t("فشل في فحص الحالة:", "Status check failed:")} ${msg}`);
    } finally {
      setCheckingStatusIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const tabs = useMemo(
    () => [
      { id: "overview", label: t("نظرة عامة", "Overview"), icon: "📊" },
      {
        id: "documents",
        label: t("إدارة المستندات", "Document Management"),
        icon: "📄",
      },
      {
        id: "users",
        label: t("إدارة المستخدمين", "User Management"),
        icon: "👥",
      },
      { id: "analytics", label: t("التحليلات", "Analytics"), icon: "📈" },
      { id: "settings", label: t("الإعدادات", "Settings"), icon: "⚙️" },
    ],
    [t]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("جاري التحميل...", "Loading...")}</div>
      </div>
    );
  }

  return (
    <div dir={direction} className={`max-w-7xl mx-auto p-6 ${alignment}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("لوحة الإدارة", "Admin Dashboard")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t(
            "إدارة نظام SanadGPT والتحكم في المستندات والمستخدمين",
            "Manage the SanadGPT system, documents, and users"
          )}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className={`-mb-px flex space-x-8 ${reverseSpacing}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span
                className={direction === "rtl" ? "ml-2" : "mr-2"}
                aria-hidden
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === "overview" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("نظرة عامة", "Overview")}
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics?.totalDocuments || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("إجمالي المستندات", "Total Documents")}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics?.documentsByStatus.ready || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("مستندات جاهزة", "Ready Documents")}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics?.documentsByStatus.processing || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("قيد المعالجة", "Processing")}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics?.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("إجمالي المستخدمين", "Total Users")}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("آخر المستندات المرفوعة", "Recent uploads")}
                </h3>
                <div className="space-y-3">
                  {analytics?.recentUploads.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString(
                            "ar-SA"
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          doc.status === "ready"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("المستخدمون النشطون", "Active users")}
                </h3>
                <div className="space-y-3">
                  {analytics?.activeUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString(
                                "ar-SA"
                              )
                            : t("لم يسجل دخول", "Never signed in")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {t("إدارة المستندات", "Document management")}
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {t("رفع مستند جديد", "Upload new document")}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("العنوان", "Title")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("الحالة", "Status")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("الإمارة", "Emirate")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("تاريخ الرفع", "Upload date")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("الإجراءات", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              doc.status === "ready"
                                ? "bg-green-100 text-green-800"
                                : doc.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {doc.status}
                          </span>
                          {doc.status === "processing" && (
                            <button
                              onClick={() => checkDocumentStatus(doc.id)}
                              disabled={checkingStatusIds.has(doc.id)}
                              className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t("فحص حالة المعالجة", "Check processing status")}
                            >
                              {checkingStatusIds.has(doc.id)
                                ? t("جاري الفحص...", "Checking...")
                                : t("فحص", "Check")}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {doc.emirate_scope || t("غير محدد", "Not specified")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(doc.uploaded_at).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t("حذف", "Delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("إدارة المستخدمين", "User management")}
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("البريد الإلكتروني", "Email")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("تاريخ التسجيل", "Registration date")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("آخر تسجيل دخول", "Last sign in")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("الحالة", "Status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.created_at).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString(
                              "ar-SA"
                            )
                          : t("لم يسجل دخول", "Never")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                          {t("نشط", "Active")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("التحليلات", "Analytics")}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("توزيع المستندات", "Document distribution")}
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics?.documentsByStatus || {}).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center"
                      >
                        <span className="capitalize">{status}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("إحصائيات النظام", "System statistics")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t("إجمالي المستندات", "Total documents")}:</span>
                    <span className="font-bold">
                      {analytics?.totalDocuments || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("إجمالي المستخدمين", "Total users")}:</span>
                    <span className="font-bold">
                      {analytics?.totalUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("معدل النجاح", "Success rate")}:</span>
                    <span className="font-bold">
                      {analytics?.totalDocuments
                        ? Math.round(
                            ((analytics.documentsByStatus.ready || 0) /
                              analytics.totalDocuments) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("إعدادات النظام", "System settings")}
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("إعدادات OpenAI", "OpenAI settings")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vector Store ID
                    </label>
                    <input
                      type="text"
                      value={settings?.openaiVectorStoreId || "Loading..."}
                      disabled
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      API Key Status
                    </label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {settings?.openaiApiKeyStatus || "Loading..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("إعدادات قاعدة البيانات", "Database settings")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("حالة Supabase", "Supabase status")}
                    </label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {t("متصل", "Connected")}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("إجمالي السجلات", "Total records")}
                    </label>
                    <span className="font-bold">
                      {analytics?.totalDocuments || 0} {t("مستندات", "documents")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("إجراءات النظام", "System actions")}
                </h3>
                <div className="space-y-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {t("تصدير البيانات", "Export data")}
                  </button>
                  <button
                    className={`bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ${
                      direction === "rtl" ? "mr-3" : "ml-3"
                    }`}
                  >
                    {t("تنظيف البيانات", "Clean up data")}
                  </button>
                  <button
                    className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ${
                      direction === "rtl" ? "mr-3" : "ml-3"
                    }`}
                  >
                    {t("إعادة تشغيل النظام", "Restart system")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
