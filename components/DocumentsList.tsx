"use client";

import { useEffect, useMemo, useState } from "react";

import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Button,
  SurfaceCard,
  type ToastPayload,
} from "@/components/ui/primitives";
import { supabase } from "@/lib/supabase";

import styles from "./documents-list.module.css";

type DocumentRow = {
  id: string;
  title: string;
  file_path: string;
  emirate_scope: string | null;
  authority_name: string | null;
  uploaded_at: string;
  status?: string;
};

interface DocumentsListProps {
  onToast?: (toast: ToastPayload) => void;
}

export default function DocumentsList({ onToast }: DocumentsListProps) {
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: queryError } = await supabase
          .from("documents")
          .select("id,title,file_path,emirate_scope,authority_name,uploaded_at,status")
          .order("uploaded_at", { ascending: false });
        if (!active) return;
        if (queryError) {
          throw queryError;
        }
        setDocs(data ?? []);
      } catch (err) {
        console.error(err);
        setDocs([]);
        setError(t("تعذر تحميل المستندات.", "Unable to load documents."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [t]);

  async function onDelete(id: string, title: string) {
    const confirmed = confirm(
      `${t("حذف المستند؟", "Delete document?")}\n${title}`
    );
    if (!confirmed) return;
    setDeletingId(id);
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);
    setDeletingId(null);
    if (deleteError) {
      const message = `${t("تعذّر الحذف:", "Failed to delete:")} ${deleteError.message}`;
      onToast?.({ title: t("لم يتم حذف المستند", "Document not deleted"), description: message, tone: "error" });
      alert(message);
      return;
    }
    setDocs((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
    onToast?.({
      title: t("تم حذف المستند", "Document deleted"),
      description: title,
      tone: "success",
    });
  }

  const skeleton = useMemo(
    () => (
      <div className={styles.skeletonGrid} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard} />
        ))}
      </div>
    ),
    []
  );

  if (loading) {
    return (
      <SurfaceCard className={styles.documentsCard} aria-busy="true" role="status">
        <div className={styles.header}>
          <h2>{t("المستندات", "Documents")}</h2>
        </div>
        {skeleton}
      </SurfaceCard>
    );
  }

  if (error) {
    return (
      <SurfaceCard className={styles.documentsCard} role="status">
        <div className={styles.errorState}>{error}</div>
      </SurfaceCard>
    );
  }

  if (!docs || docs.length === 0) {
    return (
      <SurfaceCard className={styles.documentsCard} role="status">
        <div className={styles.emptyState}>
          {t("لم يتم رفع أي مستندات بعد.", "No documents uploaded yet.")}
        </div>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className={styles.documentsCard} role="region" aria-label={t("قائمة المستندات", "Documents list")}>
      <div className={styles.header} dir={direction}>
        <h2>{t("المستندات", "Documents")}</h2>
        <span>{t("إجمالي", "Total")}: {docs.length}</span>
      </div>
      <div className={styles.collection} dir={direction}>
        {docs.map((doc) => {
          const filename = doc.file_path.split("/").pop() || doc.file_path;
          const date = new Date(doc.uploaded_at).toLocaleString();
          return (
            <article key={doc.id} className={styles.documentItem} aria-label={doc.title || filename}>
              <div className={styles.documentHeader}>
                <div>
                  <div className={styles.documentTitle} title={doc.title || filename}>
                    {doc.title || filename}
                  </div>
                  <div className={styles.documentMeta}>
                    <span>{filename}</span>
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => onDelete(doc.id, doc.title || filename)}
                  disabled={deletingId === doc.id}
                >
                  {deletingId === doc.id
                    ? t("جاري الحذف...", "Deleting...")
                    : t("حذف", "Delete")}
                </Button>
              </div>
              <div className={styles.documentMeta}>
                {doc.emirate_scope ? (
                  <span>
                    <strong>{t("النطاق", "Emirate")}:</strong> {doc.emirate_scope}
                  </span>
                ) : null}
                {doc.authority_name ? (
                  <span>
                    <strong>{t("الجهة", "Authority")}:</strong> {doc.authority_name}
                  </span>
                ) : null}
                <span>
                  <strong>{t("التاريخ", "Date")}:</strong> {date}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
