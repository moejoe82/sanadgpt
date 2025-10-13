"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();
  const alignment = direction === "rtl" ? "text-right" : "text-left";
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("error");
    if (message) {
      setError(message);
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
    setGoogleLoading(true);
    try {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(
        /\/$/,
        ""
      );
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
        "/dashboard"
      )}&source=login`;

      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (googleError) {
        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google sign-in error", err);
      setError(
        t(
          "تعذر بدء تسجيل الدخول باستخدام Google.",
          "Could not start Google sign in."
        )
      );
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Use window.location.href to force a full page reload and ensure session is available
      window.location.href = "/dashboard";
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div dir={direction} className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white ${alignment}`}>
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            {t("تسجيل الدخول", "Login")}
          </h1>
          <div className="text-xs bg-white/10 text-white px-2 py-1 rounded">
            v1.0.0
          </div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full rounded-md border border-white/20 bg-white/10 text-white py-2 hover:bg-white/20 disabled:opacity-50"
          >
            {googleButtonLabel}
          </button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-800 px-2 text-xs text-slate-300">
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
              className="w-full rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={t("أدخل بريدك الإلكتروني", "Enter your email")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("كلمة المرور", "Password")}
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-slate-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder={t("أدخل كلمة المرور", "Enter your password")}
            />
          </div>
          {error && (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white text-slate-900 py-2 hover:bg-slate-100 disabled:opacity-50"
          >
            {loading ? "..." : t("دخول", "Sign in")}
          </button>
        </form>
        <p className="mt-4 text-sm">
          {t("ليس لديك حساب؟", "Don't have an account?")} {" "}
          <a href="/register" className="text-white underline">
            {t("إنشاء حساب جديد", "Create account")}
          </a>
        </p>
      </div>
    </div>
  );
}
