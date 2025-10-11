"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function TermsOfUsePage() {
  const t = useI18n();
  const { direction } = useLanguage();
  const align = direction === "rtl" ? "text-right" : "text-left";

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-white py-20 text-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className={`mx-auto max-w-5xl px-6 ${align}`}>
        <header className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("المستندات القانونية", "Legal Documents")}
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {t("شروط استخدام SanadGPT", "SanadGPT Terms of Use")}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            {t(
              "تحدد هذه الشروط القواعد التي تنظم استخدامك لمنصة SanadGPT وخدماتها التحليلية للمستندات.",
              "These terms govern your use of the SanadGPT platform and its intelligent document analysis services."
            )}
          </p>
        </header>

        <section className="space-y-10 text-base leading-relaxed text-slate-700 dark:text-slate-200">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("١. قبول الشروط", "1. Acceptance of Terms")}
            </h2>
            <p className="mt-4">
              {t(
                "باستخدامك لمنصة SanadGPT فإنك تقر بقراءتك لهذه الشروط وفهمك لها وموافقتك على الالتزام بها. إذا لم توافق على أي بند من هذه الشروط، يرجى الامتناع عن استخدام المنصة.",
                "By accessing SanadGPT you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with any part, please discontinue using the platform."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٢. الاستخدام المسموح", "2. Permitted Use")}
            </h2>
            <p className="mt-4">
              {t(
                "تقتصر خدمات المنصة على أغراض مهنية مشروعة بما في ذلك إدارة وثائق التدقيق وتحليلها. يحظر استخدام المنصة في أي أنشطة مخالفة للقوانين المعمول بها أو حقوق الملكية الفكرية.",
                "The platform is provided for lawful professional purposes, including the management and analysis of audit documents. You may not use the service for any activity that violates applicable laws or infringes intellectual property rights."
              )}
            </p>
            <p className="mt-4">
              {t(
                "يجوز لـ SanadGPT تعليق أو إنهاء وصول أي مستخدم يتسبب في تعطيل الخدمات أو يحاول الوصول غير المصرح به إلى أنظمة المنصة.",
                "SanadGPT reserves the right to suspend or terminate access for users who disrupt the services or attempt unauthorised access to the platform's systems."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٣. حسابات المستخدم", "3. User Accounts")}
            </h2>
            <p className="mt-4">
              {t(
                "يتحمل المستخدم مسؤولية سرية بيانات تسجيل الدخول الخاصة به. يجب إبلاغ فريق SanadGPT فوراً عند اكتشاف أي استخدام غير مصرح به أو اختراق محتمل لحسابك.",
                "You are responsible for maintaining the confidentiality of your login credentials. Notify the SanadGPT team immediately if you become aware of unauthorised use or a potential security breach of your account."
              )}
            </p>
            <p className="mt-4">
              {t(
                "تحتفظ SanadGPT بالحق في رفض أو إلغاء الحسابات التي يتم إساءة استخدامها أو التي توفر معلومات مضللة.",
                "SanadGPT may refuse or cancel accounts that are misused or that provide misleading information."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٤. السرية وحماية البيانات", "4. Confidentiality & Data Protection")}
            </h2>
            <p className="mt-4">
              {t(
                "تلتزم SanadGPT بحماية سرية المستندات والبيانات التي تتم معالجتها عبر المنصة وفقاً لسياسة الخصوصية. يتم تخزين البيانات بشكل آمن ويقتصر الوصول عليها على الأغراض التشغيلية المصرح بها.",
                "SanadGPT is committed to safeguarding the confidentiality of documents and data processed through the platform in accordance with the Privacy Policy. Data is stored securely and access is limited to authorised operational purposes."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٥. التعديلات على الشروط", "5. Changes to the Terms")}
            </h2>
            <p className="mt-4">
              {t(
                "قد نقوم بتحديث هذه الشروط لتعكس تغييرات في الخدمات أو المتطلبات القانونية. يتم نشر التعديلات على هذه الصفحة ويعتبر استمرارك في استخدام المنصة بعد نشرها موافقة ضمنية على الشروط المعدلة.",
                "We may update these terms to reflect changes in our services or legal obligations. Updates will be posted on this page, and continued use after publication constitutes acceptance of the revised terms."
              )}
            </p>
          </article>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-900 p-8 text-slate-100 shadow-sm dark:border-slate-700">
          <h2 className="text-xl font-semibold">
            {t("٦. التواصل معنا", "6. Contact Us")}
          </h2>
          <p className="mt-4 text-base leading-relaxed">
            {t(
              "للاستفسارات المتعلقة بهذه الشروط يرجى التواصل معنا عبر البريد الإلكتروني support@sanadgpt.com.",
              "For questions regarding these terms, contact us at support@sanadgpt.com."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
