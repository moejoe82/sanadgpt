export default function Loading() {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-700 dark:text-slate-200">
        <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
        <div className="text-sm">جاري التحميل... / Loading...</div>
      </div>
    </div>
  );
}
