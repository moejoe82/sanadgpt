"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/components/LanguageProvider";
import PageLayout from "@/components/layouts/PageLayout";
import Container from "@/components/layouts/Container";
import AuthCard from "@/components/ui/auth-card";
import { Form, FormField, FormLabel, FormError } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Divider from "@/components/ui/divider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useI18n();
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
      const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      ).replace(/\/$/, "");
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
    <PageLayout variant="gradient-sanadgpt">
      <Container size="sm">
        <div className="relative min-h-screen flex items-center justify-center py-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-10 right-1/2 h-64 w-64 translate-x-1/3 rounded-full bg-[#d6b8ff]/20 blur-3xl" />
            <div className="absolute bottom-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f4f1d0]/20 blur-3xl" />
            <div className="absolute top-1/3 right-6 h-48 w-48 rounded-full bg-[#9c7adf]/20 blur-2xl" />
          </div>

          <AuthCard
            title={t("تسجيل الدخول", "Login")}
            version={undefined}
            variant="brand"
            className="relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col items-center text-center gap-3">
                <Image
                  src="/sanadgpt-logo.svg"
                  alt={t("شعار SanadGPT", "SanadGPT logo")}
                  width={160}
                  height={60}
                  className="w-36 h-auto drop-shadow-[0_12px_30px_rgba(141,79,191,0.35)]"
                  priority
                />
                <p className="text-sm text-[#5b2f86]">
                  {t(
                    "مرحباً بعودتك! واصل العمل على وثائق التدقيق بثقة.",
                    "Welcome back! Continue working with your audit documents confidently."
                  )}
                </p>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full justify-center gap-3 rounded-full border border-[#e4d7ff]/60 bg-[#fdfbf1]/80 py-3 text-[#2e1b4a] shadow-[0_20px_45px_-25px_rgba(46,27,74,0.45)] transition hover:border-[#d6b8ff]/80 hover:bg-[#fdfbf1]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleButtonLabel}
              </Button>

              <Divider variant="brand">{t("أو", "Or")}</Divider>

              <Form onSubmit={onSubmit} className="space-y-5">
                <FormField>
                  <FormLabel htmlFor="email">
                    {t("البريد الإلكتروني", "Email")}
                  </FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={t("أدخل بريدك الإلكتروني", "Enter your email")}
                    className="border-[#d6b8ff]/60 bg-[#fdfbf1]/90 text-[#2e1b4a] placeholder:text-[#8f75bf] focus-visible:ring-[#b68df1] focus-visible:border-[#b68df1]"
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="password">
                    {t("كلمة المرور", "Password")}
                  </FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder={t("أدخل كلمة المرور", "Enter your password")}
                    className="border-[#d6b8ff]/60 bg-[#fdfbf1]/90 text-[#2e1b4a] placeholder:text-[#8f75bf] focus-visible:ring-[#b68df1] focus-visible:border-[#b68df1]"
                  />
                </FormField>

                {error && <FormError className="text-sm text-red-500">{error}</FormError>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-[#9c7adf] via-[#b68df1] to-[#d6b8ff] px-6 py-3 text-lg text-[#2e1b4a] shadow-[0_25px_60px_-30px_rgba(85,45,135,0.85)] transition hover:from-[#a784eb] hover:to-[#e0c9ff]"
                >
                  {loading ? "..." : t("دخول", "Sign in")}
                </Button>
              </Form>

              <p className="text-center text-sm text-[#51307a]">
                {t("ليس لديك حساب؟", "Don't have an account?")}{" "}
                <a
                  href="/register"
                  className="font-semibold text-[#f05e99] transition hover:text-[#ff72ad]"
                >
                  {t("إنشاء حساب جديد", "Create account")}
                </a>
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
              <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#d6b8ff]/50 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-[#f4f1d0]/60 blur-3xl" />
            </div>
          </AuthCard>
        </div>
      </Container>
    </PageLayout>
  );
}
