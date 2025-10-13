"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

type UploadState = "idle" | "hashing" | "uploading" | "success" | "error";

async function sha256HexBrowser(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
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

  const isValidFile = useCallback((f: File) => {
    if (!ALLOWED_MIME.has(f.type)) return false;
    if (f.size > MAX_FILE_BYTES) return false;
    return true;
  }, []);

  const statusBadge = useMemo(() => {
    switch (state) {
      case "hashing":
        return <Badge variant="outline">{t("جاري التحقق", "Hashing")}</Badge>;
      case "uploading":
        return <Badge variant="outline">{t("جاري الرفع", "Uploading")}</Badge>;
      case "success":
        return <Badge variant="success">{t("تم", "Completed")}</Badge>;
      case "error":
        return <Badge variant="destructive">{t("خطأ", "Error")}</Badge>;
      default:
        return <Badge variant="outline">{t("جاهز", "Ready")}</Badge>;
    }
  }, [state, t]);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (!isValidFile(f)) {
        const warning = t(
          "نوع الملف أو حجمه غير مدعوم. يسمح بـ PDF/DOCX/TXT حتى 50MB.",
          "Unsupported type or size. Allowed: PDF/DOCX/TXT up to 50MB."
        );
        setMessage(warning);
        toast({
          title: t("ملف غير مدعوم", "Unsupported file"),
          description: warning,
        });
        return;
      }
      setFile(f);
      setState("idle");
      setProgress(0);
      setMessage(null);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    },
    [isValidFile, t, title]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onFiles(event.dataTransfer.files);
    },
    [onFiles]
  );

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  async function onUpload() {
    try {
      setMessage(null);
      if (!file) {
        const warn = t("الرجاء اختيار ملف.", "Please choose a file.");
        setMessage(warn);
        toast({
          title: t("لا يوجد ملف", "No file selected"),
          description: warn,
        });
        return;
      }
      if (!isValidFile(file)) {
        const warning = t(
          "نوع الملف أو حجمه غير مدعوم. يسمح بـ PDF/DOCX/TXT حتى 50MB.",
          "Unsupported type or size. Allowed: PDF/DOCX/TXT up to 50MB."
        );
        setMessage(warning);
        toast({
          title: t("ملف غير مدعوم", "Unsupported file"),
          description: warning,
        });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const warn = t("يجب تسجيل الدخول أولاً.", "You must be logged in first.");
        setMessage(warn);
        setState("error");
        toast({
          title: t("مطلوب تسجيل الدخول", "Authentication required"),
          description: warn,
          variant: "destructive",
        });
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
      toast({
        title: t("تم الرفع", "Upload complete"),
        description: t(
          "تم استلام المستند وسيتم فهرسته خلال دقائق.",
          "The document has been received and will be indexed shortly."
        ),
      });
      setFile(null);
    } catch (err: unknown) {
      setState("error");
      try {
        const xhr = err as XMLHttpRequest;
        const resp = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        if (xhr.status === 409 && resp?.error) {
          const detail = resp?.message || resp?.error;
          const duplicate = `${t("ملف مكرر.", "Duplicate file.")}${detail ? ` (${detail})` : ""}`;
          setMessage(duplicate);
          toast({
            title: t("ملف مكرر", "Duplicate document"),
            description: duplicate,
            variant: "destructive",
          });
        } else if (resp?.error) {
          const errorText = `${t("خطأ:", "Error:")} ${resp.error}`;
          setMessage(errorText);
          toast({
            title: t("تعذّر الرفع", "Upload failed"),
            description: errorText,
            variant: "destructive",
          });
        } else {
          const generic = t("حدث خطأ أثناء الرفع.", "Upload failed.");
          setMessage(generic);
          toast({
            title: t("تعذّر الرفع", "Upload failed"),
            description: generic,
            variant: "destructive",
          });
        }
      } catch {
        const fallback = t("حدث خطأ أثناء الرفع.", "Upload failed.");
        setMessage(fallback);
        toast({
          title: t("تعذّر الرفع", "Upload failed"),
          description: fallback,
          variant: "destructive",
        });
      }
    }
  }

  return (
    <div dir={direction} className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
      <div className="space-y-6">
        <div
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="group relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center transition hover:border-primary hover:bg-primary/5"
        >
          <input
            ref={inputRef}
            type="file"
            onChange={(event) => onFiles(event.target.files)}
            className="hidden"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg font-semibold text-foreground">
              {file ? file.name : t("اسحب الملف وأفلته هنا", "Drag & drop your file here")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("أو انقر للاختيار من جهازك.", "or click to browse from your device.")}
            </span>
          </div>
          <Button type="button" variant="outline" onClick={onBrowse} className="rounded-full px-6">
            {t("اختيار ملف", "Choose file")}
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">{t("اسم الوثيقة", "Document title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("مثال: سياسة الحوكمة 2025", "e.g. Governance Policy 2025")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emirate">
              {t("نطاق الإمارة (اختياري)", "Emirate scope (optional)")}
            </Label>
            <Input
              id="emirate"
              value={emirateScope}
              onChange={(event) => setEmirateScope(event.target.value)}
              placeholder={t("أبوظبي، دبي...", "Abu Dhabi, Dubai...")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="authority">
              {t("الجهة المصدرة (اختياري)", "Issuing authority (optional)")}
            </Label>
            <Input
              id="authority"
              value={authorityName}
              onChange={(event) => setAuthorityName(event.target.value)}
              placeholder={t("اسم الجهة الحكومية أو القسم", "Government entity or department")}
            />
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-border/60 bg-background/80 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>
              {t("سيتم مسح المستند وترميزه تلقائياً بعد الرفع.", "Documents are scanned and indexed automatically.")}
            </span>
            {state === "uploading" && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={onUpload}
            disabled={!file || state === "uploading"}
            className="min-w-[12rem]"
          >
            {state === "uploading"
              ? t("جارٍ الرفع...", "Uploading...")
              : t("بدء الرفع", "Start upload")}
          </Button>
        </div>
      </div>
    </div>
  );
}
