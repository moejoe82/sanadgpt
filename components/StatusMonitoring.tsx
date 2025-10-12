"use client";

import { useState, useEffect } from "react";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

interface DocumentStatus {
  id: string;
  title: string;
  status: "processing" | "ready" | "failed";
  uploadedAt: string;
  processingTime?: number;
}

interface StatusMonitoringProps {
  refreshInterval?: number; // in milliseconds
}

export default function StatusMonitoring({ refreshInterval = 5000 }: StatusMonitoringProps) {
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";

  const fetchDocumentStatuses = async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      const data = await response.json();
      const documentsWithStatus = data.documents.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        status: doc.status || "processing",
        uploadedAt: doc.uploaded_at,
        processingTime: doc.status === "ready" || doc.status === "failed" 
          ? Date.now() - new Date(doc.uploaded_at).getTime()
          : undefined,
      }));
      
      setDocuments(documentsWithStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentStatuses();
    
    // Set up interval for auto-refresh
    const interval = setInterval(fetchDocumentStatuses, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
      case "processing":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return t("جاهز", "Ready");
      case "failed":
        return t("فشل", "Failed");
      case "processing":
        return t("جاري المعالجة", "Processing");
      default:
        return t("غير معروف", "Unknown");
    }
  };

  const formatProcessingTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const processingDocs = documents.filter(doc => doc.status === "processing");
  const readyDocs = documents.filter(doc => doc.status === "ready");
  const failedDocs = documents.filter(doc => doc.status === "failed");

  if (loading) {
    return (
      <div className={`p-6 ${alignment}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${alignment}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("مراقبة حالة المستندات", "Document Status Monitoring")}
        </h3>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {processingDocs.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              {t("جاري المعالجة", "Processing")}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {readyDocs.length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {t("جاهز", "Ready")}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {failedDocs.length}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">
              {t("فشل", "Failed")}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="text-red-600 dark:text-red-400">
              {t("خطأ في تحميل البيانات:", "Error loading data:")} {error}
            </div>
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t("لا توجد مستندات", "No documents found")}
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {doc.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("تم الرفع:", "Uploaded:")} {new Date(doc.uploadedAt).toLocaleString("en-US")}
                  </div>
                  {doc.processingTime && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("وقت المعالجة:", "Processing time:")} {formatProcessingTime(doc.processingTime)}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {getStatusText(doc.status)}
                  </span>
                </div>
              </div>
              
              {doc.status === "processing" && (
                <div className="mt-3">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      {t("جاري التحقق من إمكانية البحث...", "Checking searchability...")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {t("تحديث تلقائي كل", "Auto-refresh every")} {refreshInterval / 1000}s
      </div>
    </div>
  );
}
