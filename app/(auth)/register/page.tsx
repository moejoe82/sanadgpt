"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/LanguageProvider";

export default function RegisterPage() {
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess("تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني.");
  }

  return (
    <div className="text-right">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t('auth.register')}</h1>
        <div className="flex items-center gap-2">
          <div className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
            v1.0.0
          </div>
          <LanguageToggle />
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('auth.email')}
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
            {t('auth.password')}
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
            تأكيد كلمة المرور / Confirm Password
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
          {loading ? "..." : t('auth.createAccount')}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {t('auth.hasAccount')}{" "}
        <a href="/login" className="text-slate-900 underline">
          {t('auth.login')}
        </a>
      </p>
    </div>
  );
}
