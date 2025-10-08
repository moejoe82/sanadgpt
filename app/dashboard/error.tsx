"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div dir="rtl" className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center text-slate-800 dark:text-slate-100">
        <div className="text-lg font-semibold">حدث خطأ / Error occurred</div>
        <div className="text-sm max-w-md break-words opacity-80">
          {error?.message || "Unknown error"}
        </div>
        <button
          onClick={reset}
          className="rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
        >
          إعادة المحاولة / Retry
        </button>
      </div>
    </div>
  );
}
