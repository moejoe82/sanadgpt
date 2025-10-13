import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Reusable page header component
 * 
 * Provides consistent title, subtitle, and actions area layout.
 * Used across all pages for consistent header styling.
 */
export default function PageHeader({ 
  children, 
  title, 
  subtitle, 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8", className)}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg sm:text-xl text-slate-200 mt-2">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </header>
  );
}
