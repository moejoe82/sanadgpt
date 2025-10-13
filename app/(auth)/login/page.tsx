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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useI18n();
  const { direction } = useLanguage();
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
    <PageLayout variant="gradient-dark">
      <Container size="sm">
        <div className="min-h-screen flex items-center justify-center py-12">
          <AuthCard title={t("تسجيل الدخول", "Login")}>
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
                  autoComplete="current-password"
                  placeholder={t("أدخل كلمة المرور", "Enter your password")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:ring-white/50"
                />
              </FormField>

              {error && <FormError>{error}</FormError>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "..." : t("دخول", "Sign in")}
              </Button>
            </Form>

            <p className="mt-4 text-sm text-slate-300">
              {t("ليس لديك حساب؟", "Don't have an account?")}{" "}
              <a href="/register" className="text-white underline">
                {t("إنشاء حساب جديد", "Create account")}
              </a>
            </p>
          </AuthCard>
        </div>
      </Container>
    </PageLayout>
  );
}