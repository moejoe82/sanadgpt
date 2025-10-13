"use client";

import { useEffect, useMemo, useState } from "react";
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
    <PageLayout variant="gradient-dark">
      <Container size="sm">
        <div className="min-h-screen flex items-center justify-center py-12">
          <AuthCard title={t("إنشاء حساب", "Create account")}>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full"
              >
                {googleButtonLabel}
              </Button>
              
              <Divider>{t("أو", "Or")}</Divider>
            </div>

            <Form onSubmit={onSubmit}>
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:ring-white/50"
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
                  autoComplete="new-password"
                  minLength={6}
                  placeholder={t("أدخل كلمة المرور", "Enter your password")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:ring-white/50"
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="confirm">
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:ring-white/50"
                />
              </FormField>

              {error && <FormError>{error}</FormError>}
              {success && (
                <p className="text-sm text-green-300" role="status">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "..." : t("تسجيل", "Register")}
              </Button>
            </Form>

            <p className="mt-4 text-sm text-slate-300">
              {t("لديك حساب؟", "Already have an account?")}{" "}
              <a href="/login" className="text-white underline">
                {t("تسجيل الدخول", "Login")}
              </a>
            </p>
          </AuthCard>
        </div>
      </Container>
    </PageLayout>
  );
}