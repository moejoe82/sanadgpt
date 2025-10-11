"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

type UploadState = "idle" | "hashing" | "uploading" | "success" | "error";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

async function sha256HexBrowser(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++)
    hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

export default function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [emirateScope, setEmirateScope] = useState("");
  const [authorityName, setAuthorityName] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";

  const isValidFile = useCallback((f: File) => {
    if (!ALLOWED_MIME.has(f.type)) return false;
    if (f.size > MAX_FILE_BYTES) return false;
    return true;
  }, []);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (!isValidFile(f)) {
        setMessage(
          t(
            "نوع الملف أو حجمه غير مدعوم. يسمح بـ PDF/DOCX/TXT حتى 50MB.",
            "Unsupported type or size. Allowed: PDF/DOCX/TXT up to 50MB."
          )
        );
        return;
      }
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    },
    [isValidFile, t, title]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const dragClasses = useMemo(
    () =>
      "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50",
    []
  );

  async function onUpload() {
    try {
      setMessage(null);
      if (!file) {
        setMessage(t("الرجاء اختيار ملف.", "Please choose a file."));
        return;
      }
      if (!isValidFile(file)) {
        setMessage(
          t(
            "نوع الملف أو حجمه غير مدعوم. يسمح بـ PDF/DOCX/TXT حتى 50MB.",
            "Unsupported type or size. Allowed: PDF/DOCX/TXT up to 50MB."
          )
        );
        return;
      }

      // Pre-check: user must be logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage(t("يجب تسجيل الدخول أولاً.", "You must be logged in first."));
        setState("error");
        return;
      }

      setState("hashing");
      await sha256HexBrowser(file);

      // Get access token for Authorization header
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Build form-data
      const form = new FormData();
      form.set("document", file);
      form.set("title", title || file.name);
      if (emirateScope) form.set("emirate_scope", emirateScope);
      if (authorityName) form.set("authority_name", authorityName);

      setState("uploading");
      setProgress(0);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/documents/upload", true);
        xhr.withCredentials = true;
        if (accessToken) {
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        }
        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setProgress(pct);
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(xhr);
            }
          }
        };
        xhr.onerror = () => reject(xhr);
        xhr.send(form);
      });

      setState("success");
      setMessage(t("تم رفع المستند بنجاح.", "Document uploaded successfully."));
      setProgress(100);
      setFile(null);
    } catch (err: unknown) {
      setState("error");
      try {
        const xhr = err as XMLHttpRequest;
        const resp = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        // Expecting duplicate error shape to surface clearly in UI
        // Example: { error: "DUPLICATE", sha256: "...", message: "Duplicate file" }
        if (xhr.status === 409 && resp?.error) {
          const detail = resp?.message || resp?.error;
          setMessage(
            `${t("ملف مكرر.", "Duplicate file.")}${detail ? ` (${detail})` : ""}`
          );
        } else if (resp?.error) {
          setMessage(
            `${t("خطأ:", "Error:")} ${resp.error}`
          );
        } else {
          setMessage(t("حدث خطأ أثناء الرفع.", "Upload failed."));
        }
      } catch {
        setMessage(t("حدث خطأ أثناء الرفع.", "Upload failed."));
      }
    }
  }

  return (
    <div dir={direction} className={`space-y-4 ${alignment}`}>
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={dragClasses}
        onClick={onBrowse}
      >
        <p className="text-slate-700">
          {t("اسحب وأسقط الملف هنا أو انقر للاختيار", "Drag and drop or click")}
        </p>
        <p className="text-xs text-slate-500">PDF / DOCX / TXT • ≤ 50MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("العنوان", "Title")}
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("عنوان المستند", "Document title")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("نطاق الإمارة", "Emirate scope")}
          </label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={emirateScope}
            onChange={(e) => setEmirateScope(e.target.value)}
          >
            <option value="">—</option>
            <option value="abu_dhabi">{t("أبوظبي", "Abu Dhabi")}</option>
            <option value="dubai">{t("دبي", "Dubai")}</option>
            <option value="sharjah">{t("الشارقة", "Sharjah")}</option>
            <option value="ajman">{t("عجمان", "Ajman")}</option>
            <option value="umm_al_quwain">{t("أم القيوين", "Umm Al Quwain")}</option>
            <option value="ras_al_khaimah">{t("رأس الخيمة", "Ras Al Khaimah")}</option>
            <option value="fujairah">{t("الفجيرة", "Fujairah")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("اسم الجهة", "Authority name")}
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={authorityName}
            onChange={(e) => setAuthorityName(e.target.value)}
            placeholder={t(
              "مثال: دائرة المالية",
              "e.g., Department of Finance"
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onUpload}
          disabled={!file || state === "uploading"}
          className="rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {state === "uploading"
            ? t("جاري الرفع...", "Uploading...")
            : t("رفع", "Upload")}
        </button>
        {state === "uploading" && (
          <div className="w-full h-2 bg-slate-200 rounded">
            <div
              className="h-2 bg-slate-900 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
