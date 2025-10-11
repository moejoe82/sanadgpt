export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <main className="max-w-6xl mx-auto px-6 py-16" dir="rtl">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">SanadGPT</h1>
          <p className="text-lg sm:text-xl text-slate-200 mb-8">
            نظام ذكي لإدارة وثائق التدقيق / Intelligent Audit System
          </p>
          <a
            href="/login"
            className="inline-block rounded-md bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-100"
          >
            ابدأ الآن / Get Started
          </a>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6" dir="rtl">
          <div className="rounded-xl bg-white/10 backdrop-blur border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-2">
              رفع المستندات / Easy Upload
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              حمّل ملفات PDF/DOCX/TXT بسهولة مع دعم السحب والإفلات وتنظيم
              تلقائي.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-2">
              بحث ذكي / Smart Search
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              استعرض المحتوى بسرعة مع فهرسة向 ودمج مع البحث بالملفات لاستخراج
              المراجع.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-2">
              إجابات دقيقة / Accurate Answers
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              احصل على إجابات ثنائية اللغة مدعومة بالاقتباسات من مصادر موثوقة.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
