"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useI18n, useLanguage } from "@/components/LanguageProvider";
import PageLayout from "@/components/layouts/PageLayout";
import Container from "@/components/layouts/Container";
import AuthCard from "@/components/ui/auth-card";
import { Form, FormField, FormLabel, FormError } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Divider from "@/components/ui/divider";
import { cn } from "@/lib/utils";

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
  const searchParams = useSearchParams();
  const isRTL = direction === "rtl";

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
    <PageLayout variant="gradient-sanadgpt">
      <Container size="sm">
        <div
          dir={direction}
          className="relative min-h-screen flex items-center justify-center py-16"
        >
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div
              className={cn(
                "absolute -top-10 h-64 w-64 rounded-full bg-[#bed6ff]/30 blur-3xl",
                isRTL
                  ? "left-1/2 -translate-x-1/3"
                  : "right-1/2 translate-x-1/3"
              )}
            />
            <div className="absolute bottom-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f9b233]/25 blur-3xl" />
            <div
              className={cn(
                "absolute top-1/3 h-48 w-48 rounded-full bg-[#1e62b7]/25 blur-2xl",
                isRTL ? "left-6" : "right-6"
              )}
            />
          </div>

          <AuthCard
            title={t("إنشاء حساب", "Create account")}
            variant="brand"
            className="relative overflow-hidden"
            dir={direction}
          >
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <Image
                  src="/sanadgpt-logo.svg"
                  alt={t("شعار SanadGPT", "SanadGPT logo")}
                  width={200}
                  height={80}
                  className="h-auto w-44 drop-shadow-[0_12px_30px_rgba(30,98,183,0.3)]"
                  priority
                />
                <p className="text-sm text-[#1e62b7]">
                  {t(
                    "ابدأ رحلتك معنا وأنشئ حساباً لإدارة وثائق التدقيق بذكاء.",
                    "Start your journey with us and create an account to manage audit documents intelligently."
                  )}
                </p>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full justify-center gap-3 rounded-full border border-[#c8dcfa]/80 bg-[#f7f9fd]/90 py-3 text-[#0f2a5a] shadow-[0_20px_45px_-25px_rgba(15,58,125,0.45)] transition hover:border-[#a9c7f2]/90 hover:bg-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
                  <FormLabel
                    htmlFor="email"
                    className="text-[#0f2a5a]"
                  >
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
                    className="border-[#c8dcfa]/80 bg-white/90 text-[#0f2a5a] placeholder:text-[#7a9ac6] focus-visible:border-[#1e62b7] focus-visible:ring-[#1e62b7]"
                  />
                </FormField>

                <FormField>
                  <FormLabel
                    htmlFor="password"
                    className="text-[#0f2a5a]"
                  >
                    {t("كلمة المرور", "Password")}
                  </FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                    placeholder={t("أدخل كلمة المرور", "Enter your password")}
                    className="border-[#c8dcfa]/80 bg-white/90 text-[#0f2a5a] placeholder:text-[#7a9ac6] focus-visible:border-[#1e62b7] focus-visible:ring-[#1e62b7]"
                  />
                </FormField>

                <FormField>
                  <FormLabel
                    htmlFor="confirm"
                    className="text-[#0f2a5a]"
                  >
                    {t("تأكيد كلمة المرور", "Confirm password")}
                  </FormLabel>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                    placeholder={t("أكد كلمة المرور", "Confirm your password")}
                    className="border-[#c8dcfa]/80 bg-white/90 text-[#0f2a5a] placeholder:text-[#7a9ac6] focus-visible:border-[#1e62b7] focus-visible:ring-[#1e62b7]"
                  />
                </FormField>

                {error && (
                  <FormError className="text-sm text-red-500">
                    {error}
                  </FormError>
                )}

                {success && (
                  <p
                    className="rounded-full bg-[#f7f9fd]/95 px-4 py-2 text-center text-sm font-medium text-[#0f2a5a] shadow-[0_15px_35px_-25px_rgba(15,58,125,0.45)]"
                    role="status"
                  >
                    {success}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-[#0f3c7d] via-[#1e62b7] to-[#2d7dd2] px-6 py-3 text-lg text-white shadow-[0_25px_60px_-30px_rgba(15,58,125,0.7)] transition hover:from-[#13488f] hover:to-[#3b8ae0]"
                >
                  {loading ? "..." : t("تسجيل", "Register")}
                </Button>
              </Form>

              <p className="text-center text-sm text-[#1e62b7]">
                {t("لديك حساب؟", "Already have an account?")}{" "}
                <a
                  href="/login"
                  className="font-semibold text-[#f9b233] transition hover:text-[#f7a614]"
                >
                  {t("تسجيل الدخول", "Login")}
                </a>
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
              <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#bed6ff]/45 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-[#f9b233]/35 blur-3xl" />
            </div>
          </AuthCard>
        </div>
      </Container>
    </PageLayout>
  );
}