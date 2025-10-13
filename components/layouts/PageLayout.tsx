import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { layoutVariants } from "@/lib/theme";

interface PageLayoutProps {
  children: ReactNode;
  variant?: keyof typeof layoutVariants;
  className?: string;
}

/**
 * Universal page wrapper component
 * 
 * Handles min-height, background, and flex column layout.
 * Replaces all page-specific background and layout logic.
 */
export default function PageLayout({ 
  children, 
  variant = "default", 
  className 
}: PageLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        layoutVariants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
