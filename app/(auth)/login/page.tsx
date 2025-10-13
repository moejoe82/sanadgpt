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
    <section
      dir={direction}
      className={`${alignment} mx-auto flex w-full max-w-sm flex-col gap-6`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {t("تسجيل الدخول", "Login")}
        </h1>
        <div className="rounded px-2 py-1 text-xs text-muted-foreground">
          v1.0.0
        </div>
      </div>
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full rounded-md border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-card/90 disabled:opacity-60"
        >
          {googleButtonLabel}
        </button>
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">
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
            className="w-full rounded-md border border-border/80 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            className="w-full rounded-md border border-border/80 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "..." : t("دخول", "Sign in")}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {t("ليس لديك حساب؟", "Don't have an account?")} {" "}
        <a href="/register" className="text-primary underline">
          {t("إنشاء حساب جديد", "Create account")}
        </a>
      </p>
    </section>
  );
}
