"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  File,
  FileImage,
  Download,
  Eye,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const t = useI18n();
  const { direction } = useLanguage();

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

  // Helper function to get file extension
  const getFileExtension = (filePath: string): string => {
    return filePath.split(".").pop()?.toLowerCase() || "";
  };

  // Helper function to get file format icon
  const getFileIcon = (filePath: string) => {
    const extension = getFileExtension(filePath);
    switch (extension) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "txt":
        return <FileText className="w-5 h-5 text-gray-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Filter documents based on search, format, and date
  const filteredDocs = useMemo(() => {
    if (!docs) return [];

    let filtered = docs;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.emirate_scope
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          doc.authority_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by file format
    if (selectedFormat !== "all") {
      filtered = filtered.filter((doc) => {
        const extension = getFileExtension(doc.file_path);
        return extension === selectedFormat;
      });
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.uploaded_at);
        const docDateOnly = new Date(
          docDate.getFullYear(),
          docDate.getMonth(),
          docDate.getDate()
        );

        switch (dateFilter) {
          case "today":
            return docDateOnly.getTime() === today.getTime();
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return docDateOnly >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return docDateOnly >= monthAgo;
          case "year":
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            return docDateOnly >= yearAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [docs, searchQuery, selectedFormat, dateFilter]);

  const skeleton = useMemo(
    () => (
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-border/60 bg-muted/30 animate-pulse"
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
      <div
        dir={direction}
        className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55"
      >
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
    <div
      dir={direction}
      className="rounded-3xl border border-border/60 bg-background/70 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/55"
    >
      <div className="p-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("البحث في المستندات...", "Search documents...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* File Format Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("النوع:", "Type:")}
              </span>
              <div className="flex gap-1">
                <Button
                  variant={selectedFormat === "all" ? "solid" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("all")}
                  className="text-xs"
                >
                  {t("الكل", "All")}
                </Button>
                <Button
                  variant={selectedFormat === "pdf" ? "solid" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("pdf")}
                  className="text-xs"
                >
                  PDF
                </Button>
                <Button
                  variant={selectedFormat === "docx" ? "solid" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("docx")}
                  className="text-xs"
                >
                  Word
                </Button>
                <Button
                  variant={selectedFormat === "txt" ? "solid" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("txt")}
                  className="text-xs"
                >
                  Text
                </Button>
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("التاريخ:", "Date:")}
              </span>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("الكل", "All")}</SelectItem>
                  <SelectItem value="today">{t("اليوم", "Today")}</SelectItem>
                  <SelectItem value="week">
                    {t("هذا الأسبوع", "This Week")}
                  </SelectItem>
                  <SelectItem value="month">
                    {t("هذا الشهر", "This Month")}
                  </SelectItem>
                  <SelectItem value="year">
                    {t("هذا العام", "This Year")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredDocs.length === docs.length
              ? t(
                  `عرض ${docs.length} مستند`,
                  `Showing ${docs.length} documents`
                )
              : t(
                  `عرض ${filteredDocs.length} من ${docs.length} مستند`,
                  `Showing ${filteredDocs.length} of ${docs.length} documents`
                )}
          </p>
          {(searchQuery ||
            selectedFormat !== "all" ||
            dateFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedFormat("all");
                setDateFilter("all");
              }}
              className="text-xs"
            >
              {t("مسح الفلاتر", "Clear Filters")}
            </Button>
          )}
        </div>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || selectedFormat !== "all" || dateFilter !== "all"
                ? t("لا توجد نتائج", "No results found")
                : t("لا توجد مستندات", "No documents")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedFormat !== "all" || dateFilter !== "all"
                ? t(
                    "جرب تغيير الفلاتر أو البحث بكلمات مختلفة",
                    "Try changing filters or searching with different keywords"
                  )
                : t(
                    "ابدأ برفع مستنداتك الأولى",
                    "Start by uploading your first documents"
                  )}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocs.map((doc) => {
              const date = new Date(doc.uploaded_at);
              const formattedDate = new Intl.DateTimeFormat(
                languageToLocale(direction),
                {
                  dateStyle: "medium",
                }
              ).format(date);

              return (
                <Card
                  key={doc.id}
                  className="group flex flex-col border border-border/60 bg-background/80 shadow-soft min-h-0 hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader className="gap-2 p-4 pb-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold text-foreground break-words line-clamp-2 leading-tight">
                          {doc.title || "Document"}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.file_path)}
                        <Badge
                          variant="success"
                          className="flex-shrink-0 text-xs px-2 py-1"
                        >
                          {t("جاهز", "Ready")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted/50 px-2 py-1">
                        {t("رفع", "Uploaded")} • {formattedDate}
                      </span>
                      {doc.emirate_scope && (
                        <span className="rounded-full bg-muted/50 px-2 py-1">
                          {doc.emirate_scope}
                        </span>
                      )}
                      {doc.authority_name && (
                        <span className="rounded-full bg-muted/50 px-2 py-1">
                          {doc.authority_name}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="border-t border-border/60 bg-background/70 p-4 pt-3 mt-auto">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-center rounded-full"
                        onClick={() => {
                          // TODO: Implement view functionality
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t("عرض", "View")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-center rounded-full"
                        onClick={() => {
                          // TODO: Implement download functionality
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t("تحميل", "Download")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPendingDelete({
                            id: doc.id,
                            title: doc.title || "Document",
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {pendingDelete && (
        <Dialog
          open={!!pendingDelete}
          onOpenChange={() => setPendingDelete(null)}
        >
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
              {pendingDelete.title}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDelete(null)}>
                {t("إلغاء", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletingId === pendingDelete.id}
              >
                {deletingId === pendingDelete.id
                  ? t("جارٍ الحذف...", "Removing...")
                  : t("تأكيد الحذف", "Confirm delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function languageToLocale(direction: "rtl" | "ltr") {
  return direction === "rtl" ? "ar-EG" : "en-US";
}
