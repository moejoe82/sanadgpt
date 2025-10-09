"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation, useLanguage } from "@/lib/LanguageProvider";
import { supabase } from "@/lib/supabase";

type UploadState = "idle" | "uploading" | "success" | "error";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB per file
const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500MB total
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

interface BulkUploadFile {
  file: File;
  title: string;
  isValid: boolean;
  error?: string;
}

interface BulkUploadTemplate {
  emirateScope: string;
  authorityName: string;
}

interface UploadResult {
  fileId: string;
  title: string;
  filename: string;
  status: "success" | "error";
  error?: string;
}

interface UploadSummary {
  total: number;
  successful: number;
  failed: number;
}

export default function BulkDocumentUpload() {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [template, setTemplate] = useState<BulkUploadTemplate>({
    emirateScope: "",
    authorityName: "",
  });
  const [files, setFiles] = useState<BulkUploadFile[]>([]);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isValidFile = useCallback((f: File) => {
    if (!ALLOWED_MIME.has(f.type)) return false;
    if (f.size > MAX_FILE_BYTES) return false;
    return true;
  }, []);

  const validateFiles = useCallback(
    (fileList: FileList) => {
      const totalSize = Array.from(fileList).reduce(
        (sum, file) => sum + file.size,
        0
      );
      if (totalSize > MAX_TOTAL_BYTES) {
        setMessage(t("doc.bulkUploadTooLarge"));
        return [];
      }

      return Array.from(fileList).map((file) => {
        const isValid = isValidFile(file);
        const title = file.name.replace(/\.[^.]+$/, "");
        return {
          file,
          title,
          isValid,
          error: !isValid
            ? file.size > MAX_FILE_BYTES
              ? t("doc.fileTooLarge")
              : t("doc.unsupportedType")
            : undefined,
        };
      });
    },
    [isValidFile, t]
  );

  const onFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const validatedFiles = validateFiles(fileList);
      setFiles((prev) => [...prev, ...validatedFiles]);
      setMessage(null);
    },
    [validateFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setMessage(null);
  }, []);

  const dragClasses = useMemo(
    () =>
      `flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`,
    [isDragOver]
  );

  const isValidTemplate = template.emirateScope && template.authorityName;
  const validFiles = files.filter((f) => f.isValid);
  const canUpload =
    isValidTemplate && validFiles.length > 0 && state !== "uploading";

  async function onUpload() {
    try {
      setMessage(null);
      setState("uploading");
      setProgress(0);

      if (!isValidTemplate) {
        setMessage(t("doc.selectTemplate"));
        setState("error");
        return;
      }

      if (validFiles.length === 0) {
        setMessage(t("doc.selectValidFiles"));
        setState("error");
        return;
      }

      // Build form-data
      const form = new FormData();
      form.set("template", JSON.stringify(template));

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage("You must be logged in to upload files");
        setState("error");
        return;
      }
      form.set("userId", user.id);

      validFiles.forEach((file) => {
        form.append("files", file.file);
        form.append("titles", file.title);
      });

      const response = await fetch("/api/documents/bulk-upload", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResults(data.results);
      setSummary(data.summary);
      setState("success");
      setProgress(100);
      setMessage(t("doc.bulkUploadSuccess"));

      // Clear files after successful upload
      setFiles([]);
    } catch (err: unknown) {
      setState("error");
      const errorMessage =
        err instanceof Error ? err.message : t("doc.uploadError");
      setMessage(errorMessage);
    }
  }

  const resetUpload = useCallback(() => {
    setState("idle");
    setProgress(0);
    setMessage(null);
    setResults([]);
    setSummary(null);
  }, []);

  return (
    <div className={`space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Template Selection */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h3
          className={`text-lg font-semibold mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("doc.bulkUploadTemplate")}
        </h3>
        <div className="grid gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("doc.emirateScope")} *
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={template.emirateScope}
              onChange={(e) =>
                setTemplate((prev) => ({
                  ...prev,
                  emirateScope: e.target.value,
                }))
              }
            >
              <option value="">—</option>
              <option value="abu_dhabi">{t("emirates.abuDhabi")}</option>
              <option value="dubai">{t("emirates.dubai")}</option>
              <option value="sharjah">{t("emirates.sharjah")}</option>
              <option value="ajman">{t("emirates.ajman")}</option>
              <option value="umm_al_quwain">{t("emirates.ummAlQuwain")}</option>
              <option value="ras_al_khaimah">
                {t("emirates.rasAlKhaimah")}
              </option>
              <option value="fujairah">{t("emirates.fujairah")}</option>
            </select>
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("doc.authorityName")} *
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={template.authorityName}
              onChange={(e) =>
                setTemplate((prev) => ({
                  ...prev,
                  authorityName: e.target.value,
                }))
              }
              placeholder={t("doc.authorityName")}
            />
          </div>
        </div>
      </div>

      {/* File Selection */}
      <div className="space-y-3">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={dragClasses}
          onClick={onBrowse}
        >
          <p className="text-slate-700">{t("doc.selectMultipleFiles")}</p>
          <p className="text-xs text-slate-500">
            PDF / DOCX / TXT • ≤ 50MB per file • ≤ 500MB total
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {t("doc.dragDropOrClick")}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {files.length} {t("doc.filesSelected")}
            </span>
            <button
              type="button"
              onClick={clearAllFiles}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {t("doc.clearAll")}
            </button>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className={`font-medium ${isRTL ? "text-right" : "text-left"}`}>
              {t("doc.selectedFiles")} ({files.length})
            </h4>
            <div className="text-xs text-slate-500 bg-blue-50 px-2 py-1 rounded">
              {t("doc.allFilesSameMetadata")}
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded border ${
                  file.isValid
                    ? "border-slate-200 bg-slate-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {file.title}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      ({file.file.name})
                    </span>
                  </div>
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-100"
                >
                  {t("doc.remove")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onUpload}
          disabled={!canUpload}
          className="rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {state === "uploading" ? t("doc.uploading") : t("doc.bulkUpload")}
        </button>
        {state === "success" && (
          <button
            onClick={resetUpload}
            className="rounded-md bg-slate-600 text-white px-4 py-2 hover:bg-slate-700"
          >
            {t("doc.uploadMore")}
          </button>
        )}
        {state === "uploading" && (
          <div className="w-full h-2 bg-slate-200 rounded">
            <div
              className="h-2 bg-slate-900 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && summary && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <h4
            className={`font-semibold mb-4 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("doc.uploadResults")}
          </h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {summary.total}
              </div>
              <div className="text-sm text-slate-600">{t("doc.total")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.successful}
              </div>
              <div className="text-sm text-slate-600">
                {t("doc.successful")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.failed}
              </div>
              <div className="text-sm text-slate-600">{t("doc.failed")}</div>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  result.status === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <span className="truncate">{result.filename}</span>
                <span className="text-xs">
                  {result.status === "success" ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <p
          className={`text-sm ${
            state === "error" ? "text-red-600" : "text-slate-700"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
