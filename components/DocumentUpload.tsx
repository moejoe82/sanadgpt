"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Button,
  FieldLabel,
  HelpText,
  Input,
  Select,
  SurfaceCard,
  type ToastPayload,
} from "@/components/ui/primitives";
import { supabase } from "@/lib/supabase";

import styles from "./document-upload.module.css";

type UploadState = "idle" | "hashing" | "uploading" | "success" | "error";

type StatusTone = "info" | "success" | "error";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
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
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

interface DocumentUploadProps {
  onToast?: (toast: ToastPayload) => void;
}

export default function DocumentUpload({ onToast }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [emirateScope, setEmirateScope] = useState("");
  const [authorityName, setAuthorityName] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const t = useI18n();
  const { direction } = useLanguage();

  const isValidFile = useCallback((f: File) => {
    if (!ALLOWED_MIME.has(f.type)) return false;
    if (f.size > MAX_FILE_BYTES) return false;
    return true;
  }, []);

  const resetStatus = useCallback(() => {
    setStatusMessage(null);
    setStatusTone("info");
  }, []);

  const announceStatus = useCallback(
    (message: string, tone: StatusTone) => {
      setStatusMessage(message);
      setStatusTone(tone);
      if (!onToast) return;
      if (tone === "info") return;
      onToast({
        title:
          tone === "success"
            ? t("تم رفع المستند", "Document uploaded")
            : t("تعذر رفع المستند", "Upload failed"),
        description: message,
        tone: tone === "success" ? "success" : "error",
      });
    },
    [onToast, t]
  );

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const selected = files[0];
      if (!isValidFile(selected)) {
        announceStatus(
          t(
            "نوع الملف أو حجمه غير مدعوم. يسمح بـ PDF/DOCX/TXT حتى 50MB.",
            "Unsupported type or size. Allowed: PDF/DOCX/TXT up to 50MB."
          ),
          "error"
        );
        return;
      }
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
      resetStatus();
    },
    [announceStatus, isValidFile, resetStatus, t, title]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onFiles(event.dataTransfer.files);
    },
    [onFiles]
  );

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const selectedFileLabel = useMemo(() => {
    if (!file) return t("لم يتم اختيار ملف", "No file selected");
    const sizeInMb = file.size / (1024 * 1024);
    return `${file.name} • ${sizeInMb.toFixed(1)} MB`;
  }, [file, t]);

  async function onUpload() {
    try {
      resetStatus();
      if (!file) {
        announceStatus(t("الرجاء اختيار ملف.", "Please choose a file."), "error");
        return;
      }
      if (!isValidFile(file)) {
        announceStatus(
          t(
            "نوع الملف أو حجمه غير مدعوم. يسمح بـ PDF/DOCX/TXT حتى 50MB.",
            "Unsupported type or size. Allowed: PDF/DOCX/TXT up to 50MB."
          ),
          "error"
        );
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        announceStatus(t("يجب تسجيل الدخول أولاً.", "You must be logged in first."), "error");
        setState("error");
        return;
      }

      setState("hashing");
      await sha256HexBrowser(file);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

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
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const pct = Math.round((event.loaded / event.total) * 100);
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
      setProgress(100);
      announceStatus(t("تم رفع المستند بنجاح.", "Document uploaded successfully."), "success");
      setFile(null);
    } catch (err: unknown) {
      setState("error");
      let message = t("حدث خطأ أثناء الرفع.", "Upload failed.");
      try {
        const xhr = err as XMLHttpRequest;
        const resp = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        if (xhr.status === 409 && resp?.error) {
          const detail = resp?.message || resp?.error;
          message = `${t("ملف مكرر.", "Duplicate file.")}${detail ? ` (${detail})` : ""}`;
        } else if (resp?.error) {
          message = `${t("خطأ:", "Error:")} ${resp.error}`;
        }
      } catch {
        // ignore parsing errors
      }
      announceStatus(message, "error");
    }
  }

  return (
    <SurfaceCard className={styles.uploadCard} role="region" aria-label={t("رفع مستند", "Upload document")}>
      <div
        className={styles.dropZone}
        dir={direction}
        role="button"
        tabIndex={0}
        onClick={onBrowse}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onBrowse();
          }
        }}
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className={styles.fileSummary}>{selectedFileLabel}</div>
        <div>
          {t("اسحب وأسقط الملف أو انقر للاختيار", "Drag a file here or click to browse")}
        </div>
        <HelpText>PDF · DOCX · TXT — ≤ 50MB</HelpText>
        <input
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(event) => onFiles(event.target.files)}
        />
      </div>

      <div className={styles.fieldGrid} dir={direction}>
        <div className={styles.fieldRow}>
          <FieldLabel htmlFor="upload-title" required>
            {t("العنوان", "Title")}
          </FieldLabel>
          <Input
            id="upload-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("عنوان المستند", "Document title")}
            required
          />
        </div>
        <div className={styles.fieldRow}>
          <FieldLabel htmlFor="upload-emirate">
            {t("نطاق الإمارة", "Emirate scope")}
          </FieldLabel>
          <Select
            id="upload-emirate"
            value={emirateScope}
            onChange={(event) => setEmirateScope(event.target.value)}
          >
            <option value="">{t("اختر", "Select")}</option>
            <option value="abu_dhabi">{t("أبوظبي", "Abu Dhabi")}</option>
            <option value="dubai">{t("دبي", "Dubai")}</option>
            <option value="sharjah">{t("الشارقة", "Sharjah")}</option>
            <option value="ajman">{t("عجمان", "Ajman")}</option>
            <option value="umm_al_quwain">{t("أم القيوين", "Umm Al Quwain")}</option>
            <option value="ras_al_khaimah">{t("رأس الخيمة", "Ras Al Khaimah")}</option>
            <option value="fujairah">{t("الفجيرة", "Fujairah")}</option>
          </Select>
        </div>
        <div className={styles.fieldRow}>
          <FieldLabel htmlFor="upload-authority">
            {t("اسم الجهة", "Authority name")}
          </FieldLabel>
          <Input
            id="upload-authority"
            value={authorityName}
            onChange={(event) => setAuthorityName(event.target.value)}
            placeholder={t("مثال: دائرة المالية", "e.g., Department of Finance")}
          />
        </div>
      </div>

      <div className={styles.actions} data-has-progress={state === "uploading"}>
        <Button onClick={onUpload} disabled={!file || state === "uploading"}>
          {state === "uploading"
            ? t("جاري الرفع...", "Uploading...")
            : t("رفع المستند", "Upload document")}
        </Button>
        {state === "uploading" ? (
          <div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className={styles.progressValue} style={{ inlineSize: `${progress}%` }} />
          </div>
        ) : null}
      </div>

      {statusMessage ? (
        <div
          className={styles.statusMessage}
          data-tone={statusTone === "info" ? undefined : statusTone}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
