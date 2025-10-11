"use client";

import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function PrivacyPolicyPage() {
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
            {t("سياسة الخصوصية لمنصة SanadGPT", "SanadGPT Privacy Policy")}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            {t(
              "نلتزم بحماية خصوصية بياناتك وتوضيح كيفية جمعها ومعالجتها والاحتفاظ بها عبر منصة SanadGPT.",
              "We are committed to protecting your privacy and explaining how data is collected, processed, and retained within SanadGPT."
            )}
          </p>
        </header>

        <section className="space-y-10 text-base leading-relaxed text-slate-700 dark:text-slate-200">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("١. البيانات التي نجمعها", "1. Information We Collect")}
            </h2>
            <p className="mt-4">
              {t(
                "نجمع المعلومات التي تقدمها عند إنشاء الحسابات، وتحميل المستندات، واستخدام مزايا النظام. قد تشمل هذه المعلومات بيانات شخصية ومهنية لازمة لتقديم الخدمة.",
                "We collect information you provide when creating accounts, uploading documents, and using platform capabilities. This may include personal and professional details required to deliver the service."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٢. كيفية استخدام البيانات", "2. How We Use Data")}
            </h2>
            <p className="mt-4">
              {t(
                "نستخدم البيانات لتحسين تجربة المستخدم، وتقديم دعم فني موثوق، وتطوير نماذج الذكاء الاصطناعي مع الالتزام بالمعايير التنظيمية.",
                "We use data to deliver a secure user experience, provide reliable support, and enhance our AI models while adhering to regulatory obligations."
              )}
            </p>
            <p className="mt-4">
              {t(
                "لا يتم مشاركة معلوماتك مع أطراف ثالثة إلا بموافقتك أو وفق ما يقتضيه القانون.",
                "Your information is not shared with third parties unless you provide consent or we are legally required to do so."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٣. حماية البيانات", "3. Data Protection")}
            </h2>
            <p className="mt-4">
              {t(
                "نطبق ضوابط تقنية وإجرائية قوية بما في ذلك التشفير، ومراجعات الصلاحيات، والمراقبة المستمرة لضمان حماية البيانات من الوصول أو الاستخدام غير المصرح به.",
                "We implement robust technical and organisational controls, including encryption, access reviews, and continuous monitoring, to protect data against unauthorised access or misuse."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٤. الاحتفاظ بالبيانات", "4. Data Retention")}
            </h2>
            <p className="mt-4">
              {t(
                "يتم الاحتفاظ بالبيانات طالما كان ذلك ضرورياً لتحقيق الأغراض المتفق عليها أو للامتثال للمتطلبات التنظيمية. يمكنك طلب حذف البيانات بما يتوافق مع سياساتنا الإجرائية.",
                "We retain data only as long as necessary to fulfil the agreed purposes or to comply with legal requirements. You may request data deletion in line with our operational policies."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("٥. حقوقك", "5. Your Rights")}
            </h2>
            <p className="mt-4">
              {t(
                "يحق لك الوصول إلى بياناتك الشخصية وتحديثها وطلب نسخة منها أو تقييد معالجتها. سنستجيب لطلباتك خلال فترة زمنية معقولة وفق القوانين المعمول بها.",
                "You have the right to access, update, obtain a copy of, or restrict processing of your personal data. We will respond to requests within a reasonable timeframe in accordance with applicable laws."
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
              "للاستفسارات المتعلقة بسياسة الخصوصية يرجى التواصل عبر البريد الإلكتروني privacy@sanadgpt.com.",
              "If you have any questions about this policy, please contact us at privacy@sanadgpt.com."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
