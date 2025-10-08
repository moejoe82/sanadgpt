"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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
    } catch (err: any) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="text-right">
      <h1 className="text-xl font-semibold mb-4">تسجيل الدخول / Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            البريد الإلكتروني / Email
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
            كلمة المرور / Password
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
          className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "..." : "دخول / Sign In"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ليس لديك حساب؟{" "}
        <a href="/register" className="text-slate-900 underline">
          إنشاء حساب جديد / Create Account
        </a>
      </p>
    </div>
  );
}
