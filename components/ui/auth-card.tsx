import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AuthCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  version?: string;
  className?: string;
  variant?: "light" | "brand";
}

/**
 * Card component for authentication pages
 *
 * Provides consistent padding, border-radius, backdrop styling
 * and version badge positioning for auth forms.
 */
const variantStyles = {
  light: {
    container:
      "rounded-xl bg-white/95 backdrop-blur-sm border border-gray-200/50 text-gray-900 shadow-xl",
    header: "flex items-center justify-between mb-4",
    title: "text-2xl font-bold text-gray-900",
    badge: "text-xs bg-gray-100 text-gray-600 border-gray-300",
  },
  brand: {
    container:
      "rounded-3xl bg-[#f7f9fd]/95 backdrop-blur-lg border border-[#dbe6f8]/80 text-[#0f2a5a] shadow-[0_35px_90px_-55px_rgba(15,58,125,0.55)] ring-1 ring-[#e0e9f8]/80",
    header: "flex flex-col items-center text-center gap-1.5 mb-4",
    title: "text-3xl font-semibold text-[#0f2a5a]",
    badge: "text-xs bg-[#eaf2ff]/80 text-[#1e62b7] border-[#c8dcfa]/80",
  },
};

export default function AuthCard({
  children,
  title,
  version,
  className,
  variant = "light",
  ...props
}: AuthCardProps) {
  const { container, header, title: titleClass, badge } = variantStyles[variant];
  const showBadge = typeof version === "string" && version.length > 0;

  return (
    <div
      {...props}
      className={cn(
        "w-full max-w-md mx-auto p-8 space-y-6",
        container,
        className
      )}
    >
      {(title || showBadge) && (
        <div className={header}>
          {title && <h1 className={titleClass}>{title}</h1>}
          {showBadge && (
            <Badge
              variant="outline"
              className={cn(badge)}
            >
              {version}
            </Badge>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
