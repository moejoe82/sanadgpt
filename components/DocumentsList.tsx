"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

type DocumentRow = {
  id: string;
  title: string;
  file_path: string;
  emirate_scope: string | null;
  authority_name: string | null;
  uploaded_at: string;
};

export default function DocumentsList() {
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("id,title,file_path,emirate_scope,authority_name,uploaded_at")
        .order("uploaded_at", { ascending: false });
      if (!active) return;
      if (error) {
        console.error(error);
        setDocs([]);
      } else {
        setDocs(data || []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onDelete(id: string, title: string) {
    const ok = confirm(`${t("حذف المستند؟", "Delete document?")}\n${title}`);
    if (!ok) return;
    setDeletingId(id);
    const { error } = await supabase.from("documents").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      alert(
        `${t("تعذّر الحذف:", "Failed to delete:")} ${error.message}`
      );
      return;
    }
    setDocs((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
  }

  const skeleton = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    ),
    []
  );

  if (loading) return skeleton;

  if (!docs || docs.length === 0)
    return (
      <div className="text-center text-slate-600 dark:text-slate-300 py-10">
        {t("لم يتم رفع أي مستندات", "No documents uploaded yet")}
      </div>
    );

  return (
    <div dir={direction} className={alignment}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((d) => {
          const filename = d.file_path.split("/").pop() || d.file_path;
          const date = new Date(d.uploaded_at).toLocaleString("en-US");
          return (
            <div
              key={d.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white/90 dark:bg-slate-900/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {d.title || filename}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {filename}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(d.id, d.title || filename)}
                  disabled={deletingId === d.id}
                  className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  {t("حذف", "Delete")}
                </button>
              </div>
              <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 space-y-1">
                {d.emirate_scope && (
                  <div>
                    {t("النطاق", "Emirate")}: {d.emirate_scope}
                  </div>
                )}
                {d.authority_name && (
                  <div>
                    {t("الجهة", "Authority")}: {d.authority_name}
                  </div>
                )}
                <div>
                  {t("التاريخ", "Date")}: {date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
