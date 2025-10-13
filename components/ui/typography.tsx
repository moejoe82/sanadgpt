import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/theme";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

interface HeadingProps extends TypographyProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface BodyProps extends TypographyProps {
  size?: "sm" | "base" | "lg";
}

/**
 * Typography components using design tokens
 * 
 * All text elements must use these components instead of
 * hardcoded className text-* classes.
 */
export function H1({ children, className, as: Component = "h1" }: HeadingProps) {
  return (
    <Component 
      className={cn(
        "text-4xl sm:text-5xl font-bold text-white",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H2({ children, className, as: Component = "h2" }: HeadingProps) {
  return (
    <Component 
      className={cn(
        "text-3xl sm:text-4xl font-bold text-white",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H3({ children, className, as: Component = "h3" }: HeadingProps) {
  return (
    <Component 
      className={cn(
        "text-xl sm:text-2xl font-semibold text-white",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Body({ children, className, size = "base" }: BodyProps) {
  const sizeClasses = {
    sm: "text-sm text-slate-200",
    base: "text-base text-slate-200", 
    lg: "text-lg text-slate-200",
  };

  return (
    <p className={cn(sizeClasses[size], className)}>
      {children}
    </p>
  );
}

export function Small({ children, className }: TypographyProps) {
  return (
    <span className={cn("text-xs text-slate-300", className)}>
      {children}
    </span>
  );
}

export function Label({ children, className }: TypographyProps) {
  return (
    <span className={cn("text-sm font-medium text-white", className)}>
      {children}
    </span>
  );
}
