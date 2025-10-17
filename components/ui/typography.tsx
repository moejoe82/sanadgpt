import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "text-4xl sm:text-5xl font-bold text-[#0f2a5a]",
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
        "text-3xl sm:text-4xl font-bold text-[#123b74]",
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
        "text-xl sm:text-2xl font-semibold text-[#184a8c]",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Body({ children, className, size = "base" }: BodyProps) {
  const sizeClasses = {
    sm: "text-sm text-[#4a607f]",
    base: "text-base text-[#3a5175]",
    lg: "text-lg text-[#2f4667]",
  };

  return (
    <p className={cn(sizeClasses[size], className)}>
      {children}
    </p>
  );
}

export function Small({ children, className }: TypographyProps) {
  return (
    <span className={cn("text-xs text-[#6f85a8]", className)}>
      {children}
    </span>
  );
}

export function Label({ children, className }: TypographyProps) {
  return (
    <span className={cn("text-sm font-medium text-[#0f2a5a]", className)}>
      {children}
    </span>
  );
}
