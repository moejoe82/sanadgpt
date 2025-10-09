"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/LanguageProvider";

type DocumentRow = {
  id: string;
  title: string;
  file_path: string;
  emirate_scope: string | null;
  authority_name: string | null;
  uploaded_at: string;
};

interface EditingDocument {
  id: string;
  field: "title" | "emirate_scope" | "authority_name";
  value: string;
}

export default function DocumentsList() {
  const t = useTranslation();
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<EditingDocument | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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
    const ok = confirm(`${t("doc.deleteConfirm")}\n${title}`);
    if (!ok) return;
    setDeletingId(id);
    const { error } = await supabase.from("documents").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      alert(`${t("doc.deleteError")}: ${error.message}`);
      return;
    }
    setDocs((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
  }

  function startEditing(
    id: string,
    field: "title" | "emirate_scope" | "authority_name",
    currentValue: string
  ) {
    setEditingDoc({ id, field, value: currentValue || "" });
  }

  function cancelEditing() {
    setEditingDoc(null);
  }

  async function saveEdit() {
    if (!editingDoc) return;

    setSavingId(editingDoc.id);
    try {
      const response = await fetch("/api/documents/update-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: editingDoc.id,
          [editingDoc.field]: editingDoc.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update document");
      }

      // Update local state
      setDocs((prev) =>
        prev
          ? prev.map((doc) =>
              doc.id === editingDoc.id
                ? { ...doc, [editingDoc.field]: editingDoc.value }
                : doc
            )
          : prev
      );

      setEditingDoc(null);
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update document");
    } finally {
      setSavingId(null);
    }
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
        {t("nav.documents")}: {t("common.loading")}
      </div>
    );

  return (
    <div className="text-right">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((d) => {
          const filename = d.file_path.split("/").pop() || d.file_path;
          const date = new Date(d.uploaded_at).toLocaleString();
          const isEditing = editingDoc?.id === d.id;
          const isSaving = savingId === d.id;

          return (
            <div
              key={d.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white/90 dark:bg-slate-900/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {isEditing && editingDoc?.field === "title" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingDoc.value}
                          onChange={(e) =>
                            setEditingDoc((prev) =>
                              prev ? { ...prev, value: e.target.value } : null
                            )
                          }
                          className="flex-1 px-2 py-1 text-sm border rounded"
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="text-green-600 hover:text-green-700 text-xs disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div
                        className="truncate cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 px-1 py-0.5 rounded"
                        onClick={() => startEditing(d.id, "title", d.title)}
                        title="Click to edit"
                      >
                        {d.title || filename}
                      </div>
                    )}
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
                  {t("doc.delete")}
                </button>
              </div>

              <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 space-y-1">
                {/* Emirate Scope */}
                <div>
                  <span className="font-medium">{t("doc.emirateScope")}: </span>
                  {isEditing && editingDoc?.field === "emirate_scope" ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editingDoc.value}
                        onChange={(e) =>
                          setEditingDoc((prev) =>
                            prev ? { ...prev, value: e.target.value } : null
                          )
                        }
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value="">—</option>
                        <option value="abu_dhabi">
                          {t("emirates.abuDhabi")}
                        </option>
                        <option value="dubai">{t("emirates.dubai")}</option>
                        <option value="sharjah">{t("emirates.sharjah")}</option>
                        <option value="ajman">{t("emirates.ajman")}</option>
                        <option value="umm_al_quwain">
                          {t("emirates.ummAlQuwain")}
                        </option>
                        <option value="ras_al_khaimah">
                          {t("emirates.rasAlKhaimah")}
                        </option>
                        <option value="fujairah">
                          {t("emirates.fujairah")}
                        </option>
                      </select>
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className="text-green-600 hover:text-green-700 text-xs disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 px-1 py-0.5 rounded"
                      onClick={() =>
                        startEditing(
                          d.id,
                          "emirate_scope",
                          d.emirate_scope || ""
                        )
                      }
                      title="Click to edit"
                    >
                      {d.emirate_scope || t("admin.notSpecified")}
                    </span>
                  )}
                </div>

                {/* Authority Name */}
                <div>
                  <span className="font-medium">
                    {t("doc.authorityName")}:{" "}
                  </span>
                  {isEditing && editingDoc?.field === "authority_name" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingDoc.value}
                        onChange={(e) =>
                          setEditingDoc((prev) =>
                            prev ? { ...prev, value: e.target.value } : null
                          )
                        }
                        className="px-2 py-1 text-sm border rounded"
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className="text-green-600 hover:text-green-700 text-xs disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 px-1 py-0.5 rounded"
                      onClick={() =>
                        startEditing(
                          d.id,
                          "authority_name",
                          d.authority_name || ""
                        )
                      }
                      title="Click to edit"
                    >
                      {d.authority_name || t("admin.notSpecified")}
                    </span>
                  )}
                </div>

                <div>
                  {t("time.date")}: {date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
