export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-center mb-6">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white">
              DiwanGPT
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
