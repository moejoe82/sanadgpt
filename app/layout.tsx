import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageShell from "@/components/LanguageShell";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SanadGPT – نظام إدارة وثائق التدقيق",
};

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "700"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tajawal.className} antialiased`}
      >
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            (function () {
              const root = document.documentElement;
              const media = window.matchMedia('(prefers-color-scheme: dark)');
              const setTheme = (isDark) => {
                const theme = isDark ? 'dark' : 'light';
                root.dataset.theme = theme;
                root.style.colorScheme = theme;
              };
              setTheme(media.matches);
              if (typeof media.addEventListener === 'function') {
                media.addEventListener('change', (event) => setTheme(event.matches));
              } else {
                media.addListener((event) => setTheme(event.matches));
              }
            })();
          `}
        </Script>
        <LanguageProvider>
          <LanguageShell>{children}</LanguageShell>
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
