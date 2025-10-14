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
  const { language } = useLanguage();
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
    <PageLayout variant="gradient-dark">
      <Container size="sm">
        <div className="min-h-screen flex items-center justify-center py-12">
          <AuthCard title={t("تسجيل الدخول", "Login")}>
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm font-medium"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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

              <Divider />
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
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
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
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>

              {error && <FormError>{error}</FormError>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "..." : t("دخول", "Sign in")}
              </Button>
            </Form>

            <p className="mt-6 text-sm text-gray-600 text-center">
              {t("ليس لديك حساب؟", "Don't have an account?")}{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("إنشاء حساب جديد", "Create account")}
              </a>
            </p>
          </AuthCard>
        </div>
      </Container>
    </PageLayout>
  );
}
