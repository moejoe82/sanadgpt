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
  className 
}: AuthCardProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-md mx-auto",
        "rounded-xl bg-white/10 backdrop-blur border border-white/10",
        "p-6 space-y-4",
        className
      )}
    >
      {(title || version) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h1 className="text-xl font-semibold text-white">
              {title}
            </h1>
          )}
          {version && (
            <Badge variant="secondary" className="text-xs">
              {version}
            </Badge>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
