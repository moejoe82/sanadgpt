"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/LanguageProvider";

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
  const t = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [emirateScope, setEmirateScope] = useState("");
  const [authorityName, setAuthorityName] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

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
        setMessage(t("doc.unsupportedType"));
        return;
      }
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    },
    [isValidFile, title, t]
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
        setMessage(t("doc.selectFile"));
        return;
      }
      if (!isValidFile(file)) {
        setMessage(t("doc.unsupportedType"));
        return;
      }

      setState("hashing");
      await sha256HexBrowser(file);

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
      setMessage(t("doc.uploadSuccess"));
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
          setMessage(t("doc.duplicateFile"));
        } else if (resp?.error) {
          setMessage(`${t("common.error")}: ${resp.error}`);
        } else {
          setMessage(t("doc.uploadError"));
        }
      } catch {
        setMessage(t("doc.uploadError"));
      }
    }
  }

  return (
    <div className="text-right space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={dragClasses}
        onClick={onBrowse}
      >
        <p className="text-slate-700">{t("doc.selectFile")}</p>
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
            {t("doc.titleOptional")}
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("doc.title")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("doc.emirateScopeOptional")}
          </label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={emirateScope}
            onChange={(e) => setEmirateScope(e.target.value)}
          >
            <option value="">—</option>
            <option value="abu_dhabi">{t("emirates.abuDhabi")}</option>
            <option value="dubai">{t("emirates.dubai")}</option>
            <option value="sharjah">{t("emirates.sharjah")}</option>
            <option value="ajman">{t("emirates.ajman")}</option>
            <option value="umm_al_quwain">{t("emirates.ummAlQuwain")}</option>
            <option value="ras_al_khaimah">{t("emirates.rasAlKhaimah")}</option>
            <option value="fujairah">{t("emirates.fujairah")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("doc.authorityNameOptional")}
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={authorityName}
            onChange={(e) => setAuthorityName(e.target.value)}
            placeholder={t("doc.authorityName")}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onUpload}
          disabled={!file || state === "uploading"}
          className="rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {state === "uploading" ? t("doc.uploading") : t("nav.upload")}
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
