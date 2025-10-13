"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

type DocumentRow = {
  id: string;
  title: string;
  file_path: string;
  emirate_scope: string | null;
  authority_name: string | null;
  uploaded_at: string;
};

type PendingDelete = {
  id: string;
  title: string;
};

export default function DocumentsList() {
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select(
          "id,title,file_path,emirate_scope,authority_name,uploaded_at"
        )
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

  const skeleton = useMemo(
    () => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-3xl border border-border/60 bg-muted/30 animate-pulse"
          />
        ))}
      </div>
    ),
    []
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      setDocs((prev) => (prev ? prev.filter((doc) => doc.id !== id) : prev));
      toast({
        title: t("تم الحذف", "Document removed"),
        description: t(
          "تم حذف المستند ولن يظهر في مساحة العمل.",
          "The document has been removed from the workspace."
        ),
      });
    } catch (error) {
      toast({
        title: t("تعذّر الحذف", "Deletion failed"),
        description:
          error instanceof Error
            ? error.message
            : t("حدث خطأ غير متوقع.", "An unexpected error occurred."),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  }

  if (loading) return skeleton;

  if (!docs || docs.length === 0)
    return (
      <div dir={direction} className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {t("لا يوجد مستندات بعد", "No documents yet")}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {t(
              "سيظهر كل ملف تقوم برفعه هنا مع حالة معالجته.",
              "Every file you upload will appear here with processing status."
            )}
          </p>
        </div>
      </div>
    );

  return (
    <div dir={direction} className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {docs.map((doc) => {
        const filename = doc.file_path.split("/").pop() || doc.file_path;
        const date = new Date(doc.uploaded_at);
        const formattedDate = new Intl.DateTimeFormat(languageToLocale(direction), {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);

        return (
          <Card
            key={doc.id}
            className="group flex h-full flex-col justify-between border border-border/60 bg-background/80 shadow-soft"
          >
            <CardHeader className="gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1 text-start">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {doc.title || filename}
                  </CardTitle>
                  <CardDescription className="truncate text-xs font-medium text-muted-foreground">
                    {filename}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
                  {t("مؤرشف", "Archived")}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted/50 px-3 py-1">
                  {t("رفع", "Uploaded")} • {formattedDate}
                </span>
                {doc.emirate_scope && (
                  <span className="rounded-full bg-muted/50 px-3 py-1">
                    {doc.emirate_scope}
                  </span>
                )}
                {doc.authority_name && (
                  <span className="rounded-full bg-muted/50 px-3 py-1">
                    {doc.authority_name}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                {t(
                  "يمكن فتح هذا المستند من لوحة الإدارة للتحقق من تفاصيله أو إعادة مزامنته.",
                  "Open from the admin console to validate or re-sync with OpenAI."
                )}
              </p>
            </CardContent>
            <CardContent className="border-t border-border/60 bg-background/70 py-4">
              <Dialog
                open={pendingDelete?.id === doc.id}
                onOpenChange={(open) =>
                  open
                    ? setPendingDelete({ id: doc.id, title: doc.title || filename })
                    : setPendingDelete(null)
                }
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => setPendingDelete({ id: doc.id, title: doc.title || filename })}
                  >
                    {deletingId === doc.id
                      ? t("جارٍ الحذف...", "Removing...")
                      : t("حذف المستند", "Delete document")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("تأكيد الحذف", "Confirm deletion")}</DialogTitle>
                    <DialogDescription>
                      {t(
                        "سيؤدي هذا إلى حذف المستند نهائياً من مساحة العمل.",
                        "This action will permanently remove the document from the workspace."
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {doc.title || filename}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPendingDelete(null)}
                    >
                      {t("إلغاء", "Cancel")}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={confirmDelete}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id
                        ? t("جارٍ الحذف...", "Removing...")
                        : t("تأكيد الحذف", "Confirm delete")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

function languageToLocale(direction: "rtl" | "ltr") {
  return direction === "rtl" ? "ar-EG" : "en-US";
}
