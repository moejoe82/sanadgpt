"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("error");
    if (message) {
      setError(message);
      setSuccess(null);
    }
  }, [searchParams]);

  const googleButtonLabel = useMemo(
    () =>
      googleLoading
        ? t("جاري التحميل...", "Loading...")
        : t("المتابعة باستخدام Google", "Continue with Google"),
    [googleLoading, t]
  );

  async function handleGoogleSignIn() {
    setError(null);
    setSuccess(null);
    setGoogleLoading(true);
    try {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(
        /\/$/,
        ""
      );
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
        "/dashboard"
      )}&source=register`;

      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (googleError) {
        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google sign-up error", err);
      setError(
        t(
          "تعذر بدء التسجيل باستخدام Google.",
          "Could not start Google sign up."
        )
      );
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirm) {
      setError(t("كلمتا المرور غير متطابقتين", "Passwords do not match"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(
      t(
        "تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني.",
        "Account created successfully. Please check your email."
      )
    );
  }

  return (
    <div dir={direction} className={alignment}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">
          {t("إنشاء حساب", "Create account")}
        </h1>
        <div className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
          v1.0.0
        </div>
      </div>
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full rounded-md border border-slate-300 bg-white text-slate-900 py-2 hover:bg-slate-50 disabled:opacity-50"
        >
          {googleButtonLabel}
        </button>
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-2 text-xs text-slate-500">
              {t("أو", "Or")}
            </span>
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("البريد الإلكتروني", "Email")}
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("كلمة المرور", "Password")}
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("تأكيد كلمة المرور", "Confirm password")}
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700" role="status">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "..." : t("تسجيل", "Register")}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {t("لديك حساب؟", "Already have an account?")} {" "}
        <a href="/login" className="text-slate-900 underline">
          {t("تسجيل الدخول", "Login")}
        </a>
      </p>
    </div>
  );
}
