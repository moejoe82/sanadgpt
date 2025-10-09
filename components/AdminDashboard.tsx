"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/LanguageProvider";
// Removed unused supabase import - now using API routes

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
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Helper function to clean mixed language status values
  const cleanStatusValue = (value: string | undefined) => {
    if (!value) return t("common.loading");
    // If the value contains mixed language (Arabic/English), extract the appropriate part
    if (value.includes(" / ")) {
      const parts = value.split(" / ");
      // For now, always return the Arabic part since we're primarily Arabic-focused
      // In the future, this could be made dynamic based on current language
      return parts[0]; // Arabic part
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("nav.admin")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("admin.description")}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
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
              <span className="ml-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === "overview" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{t("nav.overview")}</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics?.totalDocuments || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("admin.totalDocuments")}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics?.documentsByStatus.ready || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("admin.readyDocuments")}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics?.documentsByStatus.processing || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("status.processing")}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics?.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("admin.totalUsers")}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("admin.recentUploads")}
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
                            "en-US"
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
                  {t("admin.activeUsers")}
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
                                "en-US"
                              )
                            : t("admin.neverSignedIn")}
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
                {t("admin.documentManagement")}
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {t("admin.uploadNewDocument")}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("doc.title")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.status")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("doc.emirateScope")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.uploadDate")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.actions")}
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {doc.emirate_scope || t("admin.notSpecified")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(doc.uploaded_at).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t("doc.delete")}
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
              {t("admin.userManagement")}
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("auth.email")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.registrationDate")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.lastSignIn")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.status")}
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
                        {new Date(user.created_at).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString(
                              "en-US"
                            )
                          : t("admin.neverSignedIn")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                          {t("admin.active")}
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
            <h2 className="text-2xl font-bold mb-6">{t("admin.analytics")}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("admin.documentDistribution")}
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
                  {t("admin.systemStatistics")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t("admin.totalDocuments")}:</span>
                    <span className="font-bold">
                      {analytics?.totalDocuments || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("admin.totalUsers")}:</span>
                    <span className="font-bold">
                      {analytics?.totalUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("admin.successRate")}:</span>
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
              {t("admin.systemSettings")}
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("admin.openaiSettings")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("admin.vectorStoreId")}
                    </label>
                    <input
                      type="text"
                      value={
                        settings?.openaiVectorStoreId || t("common.loading")
                      }
                      disabled
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("admin.apiKeyStatus")}
                    </label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {cleanStatusValue(settings?.openaiApiKeyStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("admin.databaseSettings")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("admin.supabaseStatus")}
                    </label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {t("admin.connected")}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("admin.totalRecords")}
                    </label>
                    <span className="font-bold">
                      {analytics?.totalDocuments || 0} {t("admin.documents")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {t("admin.systemActions")}
                </h3>
                <div className="space-y-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {t("admin.exportData")}
                  </button>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ml-3">
                    {t("admin.cleanupData")}
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-3">
                    {t("admin.restartSystem")}
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
