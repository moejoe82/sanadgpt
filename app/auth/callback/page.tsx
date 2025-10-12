"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHandled = useRef(false);
  const t = useI18n();
  const { direction } = useLanguage();

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const code = searchParams.get("code");
    const errorDescription = searchParams.get("error_description");
    const next = searchParams.get("next") || "/dashboard";
    const source = searchParams.get("source") === "register" ? "register" : "login";
    const fallbackRoute = source === "register" ? "/register" : "/login";

    const redirectWithError = (message: string) => {
      const params = new URLSearchParams({ error: message });
      router.replace(`${fallbackRoute}?${params.toString()}`);
    };

    if (errorDescription) {
      redirectWithError(errorDescription);
      return;
    }

    if (!code) {
      redirectWithError(
        t("رمز المصادقة مفقود.", "Missing authentication code.")
      );
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        redirectWithError(error.message);
        return;
      }

      const destination = next.startsWith("/") ? next : "/dashboard";

      if (typeof window !== "undefined") {
        window.location.replace(destination);
      } else {
        router.replace(destination);
      }
    })();
  }, [router, searchParams, t]);

  return (
    <div
      dir={direction}
      className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
    >
      <div className="text-center space-y-3">
        <div className="h-12 w-12 border-4 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-white rounded-full animate-spin mx-auto" />
        <h1 className="text-lg font-semibold">
          {t("جاري إكمال تسجيل الدخول...", "Completing sign in...")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            "سيتم تحويلك تلقائياً خلال لحظات.",
            "You will be redirected automatically in a moment."
          )}
        </p>
      </div>
    </div>
  );
}

