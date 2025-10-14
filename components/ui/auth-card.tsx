import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AuthCardProps {
  children: ReactNode;
  title?: string;
  version?: string;
  className?: string;
}

/**
 * Card component for authentication pages
 *
 * Provides consistent padding, border-radius, backdrop styling
 * and version badge positioning for auth forms.
 */
export default function AuthCard({
  children,
  title,
  version = "v1.0.0",
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto",
        "rounded-xl bg-white/95 backdrop-blur-sm border border-gray-200/50",
        "p-8 space-y-6 shadow-xl",
        className
      )}
    >
      {(title || version) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          {version && (
            <Badge
              variant="outline"
              className="text-xs bg-gray-100 text-gray-600 border-gray-300"
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
