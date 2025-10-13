import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Vertical spacing wrapper component
 * 
 * Provides consistent vertical padding using design tokens.
 * Replaces hardcoded py-* classes throughout the app.
 */
export default function Section({ 
  children, 
  spacing = "md", 
  className 
}: SectionProps) {
  const spacingClasses = {
    sm: "py-8",
    md: "py-12", 
    lg: "py-16",
  };

  return (
    <section 
      className={cn(
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </section>
  );
}
