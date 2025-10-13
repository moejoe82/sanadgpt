/**
 * Auth Layout
 * 
 * Provides auth-specific structure with centered content.
 * Individual auth pages handle their own styling using the design system.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}
